import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Define the research result interface
interface ResearchResult {
  id: string;
  query: string;
  timestamp: string;
  insights: string[];
  dataSources: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

// In-memory storage
const researchResultsStore = new Map<string, ResearchResult>();
const aiInteractionsStore = new Map<string, any[]>();

// Mock data sources for demonstration
const mockDataSources = [
  'Market Data API',
  'Financial News API',
  'Economic Indicators',
  'Social Sentiment Analysis',
  'Company Financials',
  'SEC Filings',
  'Analyst Reports',
  'Market Research',
];

// Function to generate mock insights based on the query
function generateMockInsights(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  
  // Generate insights based on query keywords
  const insights: string[] = [];
  
  if (lowerQuery.includes('tech') || lowerQuery.includes('technology')) {
    insights.push('Tech sector has shown 15% growth in the last quarter, outperforming the S&P 500 by 5%.');
    insights.push('AI and cloud computing companies are leading the sector with 25% year-over-year revenue growth.');
    insights.push('Semiconductor stocks have experienced increased volatility due to supply chain concerns.');
  }
  
  if (lowerQuery.includes('stock') || lowerQuery.includes('stocks')) {
    insights.push('The S&P 500 has gained 8% year-to-date, with cyclical sectors showing the strongest performance.');
    insights.push('Small-cap stocks have underperformed large-caps by 3% in the current market environment.');
    insights.push('Value stocks are trading at a 20% discount to growth stocks based on forward P/E ratios.');
  }
  
  if (lowerQuery.includes('market') || lowerQuery.includes('trend')) {
    insights.push('Market breadth has improved with 65% of S&P 500 stocks trading above their 200-day moving average.');
    insights.push('Trading volume has increased by 12% compared to the previous month, indicating higher market participation.');
    insights.push('Defensive sectors like utilities and consumer staples have shown relative strength in recent weeks.');
  }
  
  if (lowerQuery.includes('crypto') || lowerQuery.includes('bitcoin')) {
    insights.push('Bitcoin has shown increased volatility with a 15% price swing in the last week.');
    insights.push('Institutional adoption of cryptocurrencies continues to grow, with major financial firms launching crypto products.');
    insights.push('Regulatory clarity remains a key factor for crypto market growth.');
  }
  
  if (lowerQuery.includes('bond') || lowerQuery.includes('bonds')) {
    insights.push('Treasury yields have risen in response to stronger economic data and inflation concerns.');
    insights.push('Corporate bond spreads have narrowed, indicating improved market sentiment toward corporate credit.');
    insights.push('Municipal bonds continue to offer tax advantages, particularly for high-income investors.');
  }
  
  if (lowerQuery.includes('real estate') || lowerQuery.includes('housing')) {
    insights.push('Housing market activity has slowed as mortgage rates remain elevated.');
    insights.push('Commercial real estate faces challenges in the office sector due to remote work trends.');
    insights.push('Rental demand remains strong, supporting multi-family real estate investments.');
  }
  
  // Default insights if no specific keywords are found
  if (insights.length === 0) {
    insights.push('Market conditions are currently favorable for long-term investors.');
    insights.push('Diversification remains a key strategy for managing investment risk.');
    insights.push('Regular portfolio rebalancing can help maintain target asset allocations.');
  }
  
  return insights;
}

// Function to determine sentiment based on insights
function determineSentiment(insights: string[]): 'positive' | 'neutral' | 'negative' {
  const positiveKeywords = ['growth', 'improved', 'strength', 'outperforming', 'favorable', 'strong'];
  const negativeKeywords = ['volatility', 'concerns', 'challenges', 'slowed', 'underperformed', 'risk'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  insights.forEach(insight => {
    const lowerInsight = insight.toLowerCase();
    positiveKeywords.forEach(keyword => {
      if (lowerInsight.includes(keyword)) positiveCount++;
    });
    negativeKeywords.forEach(keyword => {
      if (lowerInsight.includes(keyword)) negativeCount++;
    });
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Mock rate limiting function
async function isRateLimited(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  return false; // Mock implementation - no rate limiting
}

// Mock AI interactions function
async function storeAIInteraction(userId: string, interaction: any): Promise<void> {
  const interactions = aiInteractionsStore.get(userId) || [];
  interactions.push(interaction);
  aiInteractionsStore.set(userId, interactions);
}

export async function POST(request: Request) {
  try {
    // Initialize cookies first
    const cookieStore = await cookies();
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const body = await request.json();
    
    if (!body.query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Check rate limiting - 10 requests per minute
    const isLimited = await isRateLimited(`research:analyze:${userId}`, 10, 60);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Generate insights based on the query
    const insights = generateMockInsights(body.query);
    
    // Determine sentiment
    const sentiment = determineSentiment(insights);
    
    // Select random data sources
    const selectedSources = [...mockDataSources]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // Create a research result
    const result: ResearchResult = {
      id: uuidv4(),
      query: body.query,
      timestamp: new Date().toISOString(),
      insights,
      dataSources: selectedSources,
      sentiment,
    };
    
    // Store the result in memory
    researchResultsStore.set(result.id, result);
    
    // Store the AI interaction
    await storeAIInteraction(userId, {
      type: 'research',
      action: 'analyze',
      query: body.query,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in research analyze route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze research query' },
      { status: 500 }
    );
  }
} 