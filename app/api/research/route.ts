import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { CookieOptions } from '@supabase/ssr';
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import { MarketDataService } from '@/app/services/marketData';

// Define interfaces
interface SavedQuery {
  id: string;
  query: string;
  timestamp: string;
}

interface ResearchResult {
  id: string;
  query: string;
  timestamp: string;
  insights: string[];
  dataSources: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

// In-memory storage
const savedQueriesStore = new Map<string, SavedQuery>();
const recentResultsStore = new Map<string, ResearchResult>();
const aiInteractionsStore = new Map<string, any[]>();

// Mock saved queries for demonstration
const mockSavedQueries: SavedQuery[] = [
  {
    id: '1',
    query: 'What are the current market trends?',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '2',
    query: 'Analyze tech sector performance',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '3',
    query: 'Research Microsoft stock',
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

// Mock recent research results for demonstration
const mockRecentResults: ResearchResult[] = [
  {
    id: '1',
    query: 'What are the current market trends?',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    insights: [
      'Market breadth has improved with 65% of S&P 500 stocks trading above their 200-day moving average.',
      'Trading volume has increased by 12% compared to the previous month, indicating higher market participation.',
      'Defensive sectors like utilities and consumer staples have shown relative strength in recent weeks.',
    ],
    dataSources: ['Market Data API', 'Financial News API', 'Market Research'],
    sentiment: 'positive',
  },
  {
    id: '2',
    query: 'Analyze tech sector performance',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    insights: [
      'Tech sector has shown 15% growth in the last quarter, outperforming the S&P 500 by 5%.',
      'AI and cloud computing companies are leading the sector with 25% year-over-year revenue growth.',
      'Semiconductor stocks have experienced increased volatility due to supply chain concerns.',
    ],
    dataSources: ['Market Data API', 'Company Financials', 'Analyst Reports'],
    sentiment: 'positive',
  },
];

// Mock rate limiting function
async function isRateLimited(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  return false; // Mock implementation - no rate limiting
}

// Mock AI interactions function
async function getAIInteractions(userId: string): Promise<any[]> {
  return aiInteractionsStore.get(userId) || [];
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name);
            return cookie?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Check rate limiting - 30 requests per minute
    const isLimited = await isRateLimited(`research:list:${userId}`, 30, 60);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Get saved queries from in-memory store
    const savedQueries = Array.from(savedQueriesStore.values());
    
    // Get recent research results
    let recentResults: ResearchResult[] = Array.from(recentResultsStore.values());
    if (recentResults.length === 0) {
      recentResults = mockRecentResults;
    }
    
    // Get AI interactions
    const aiInteractions = await getAIInteractions(userId);
    
    return NextResponse.json({
      savedQueries,
      recentResults,
      aiInteractions,
    });
  } catch (error) {
    console.error('Error in research GET route:', error);
    return NextResponse.json(
      { error: 'Failed to get research data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name);
            return cookie?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const marketDataService = new MarketDataService();
    
    // Extract potential stock symbols from the query
    const symbolRegex = /\b[A-Z]{1,5}\b/g;
    const symbols = query.match(symbolRegex) || [];
    
    // Get market data for the symbols
    const marketData = symbols.length > 0 
      ? await marketDataService.getRealTimeData(symbols)
      : [];

    // Get technical indicators for the first symbol if available
    const technicalIndicators = symbols.length > 0
      ? await marketDataService.getTechnicalIndicators(symbols[0])
      : [];

    // Get market sentiment
    const sentiment = symbols.length > 0
      ? await marketDataService.getMarketSentiment(symbols)
      : [];

    // Get sector performance
    const sectorPerformance = await marketDataService.getSectorPerformance();

    // Get risk metrics if we have symbols
    const riskMetrics = symbols.length > 0
      ? await marketDataService.calculateRiskMetrics(symbols)
      : null;

    // Get market insights
    const marketInsights = symbols.length > 0
      ? await marketDataService.getMarketInsights(symbols)
      : null;

    // Construct the prompt with market data context
    const marketContext = marketData.length > 0
      ? `\nCurrent Market Data:\n${marketData.map(d => 
          `${d.symbol}: $${d.price} (${d.changePercent > 0 ? '+' : ''}${d.changePercent}%)`
        ).join('\n')}`
      : '';

    const technicalContext = technicalIndicators.length > 0
      ? `\nTechnical Indicators:\n${technicalIndicators.map(i => 
          `${i.name}: ${i.value} (Signal: ${i.signal})`
        ).join('\n')}`
      : '';

    const sentimentContext = sentiment.length > 0
      ? `\nMarket Sentiment:\n${sentiment.map(s => 
          `${s.symbol}: ${s.sentiment} (Confidence: ${(s.confidence * 100).toFixed(1)}%)`
        ).join('\n')}`
      : '';

    const sectorContext = sectorPerformance.length > 0
      ? `\nSector Performance:\n${sectorPerformance.map(s => 
          `${s.sector}: ${s.performance > 0 ? '+' : ''}${s.performance}%`
        ).join('\n')}`
      : '';

    const riskContext = riskMetrics
      ? `\nRisk Metrics:\nBeta: ${riskMetrics.beta.toFixed(2)}\nAlpha: ${riskMetrics.alpha.toFixed(2)}\nSharpe Ratio: ${riskMetrics.sharpeRatio.toFixed(2)}\nVolatility: ${riskMetrics.volatility.toFixed(2)}%`
      : '';

    const prompt = `As a financial research assistant, analyze the following query and provide insights based on the available market data:

Query: ${query}
${marketContext}
${technicalContext}
${sentimentContext}
${sectorContext}
${riskContext}

Please provide:
1. A concise summary of the current market situation
2. Key technical indicators and their implications
3. Market sentiment analysis
4. Risk assessment
5. Actionable insights and recommendations

Focus on providing clear, data-driven insights that would be valuable for investment decisions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial research assistant with expertise in market analysis, technical analysis, and risk management. Provide clear, concise, and actionable insights based on available market data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({
      response: aiResponse,
      marketData,
      technicalIndicators,
      sentiment,
      sectorPerformance,
      riskMetrics,
      marketInsights,
    });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: 'Failed to process research request' },
      { status: 500 }
    );
  }
} 