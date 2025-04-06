import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { CookieOptions } from '@supabase/ssr';
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
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name);
          },
        },
      }
    );

    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
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
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name);
          },
        },
      }
    );

    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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

    // Generate market insights based on the data
    const marketInsights = [
      {
        type: 'technical' as const,
        title: 'Technical Analysis',
        description: symbols.length > 0
          ? `Technical indicators for ${symbols.join(', ')} show ${technicalIndicators[0]?.signal || 'neutral'} signals.`
          : 'No technical indicators available for the current query.',
        confidence: 0.8,
        timestamp: new Date().toISOString(),
      },
      {
        type: 'fundamental' as const,
        title: 'Market Overview',
        description: 'Current market conditions show mixed signals across different sectors.',
        confidence: 0.7,
        timestamp: new Date().toISOString(),
      },
      {
        type: 'sentiment' as const,
        title: 'Market Sentiment',
        description: sentiment.length > 0
          ? `Market sentiment for ${symbols.join(', ')} is ${sentiment[0]?.sentiment || 'neutral'}.`
          : 'No sentiment data available for the current query.',
        confidence: 0.75,
        timestamp: new Date().toISOString(),
      },
    ];

    // Generate AI response
    const prompt = `
      Based on the following market data and query, provide a comprehensive analysis:
      
      Query: ${query}
      
      Market Data:
      ${JSON.stringify(marketData, null, 2)}
      
      Technical Indicators:
      ${JSON.stringify(technicalIndicators, null, 2)}
      
      Market Sentiment:
      ${JSON.stringify(sentiment, null, 2)}
      
      Sector Performance:
      ${JSON.stringify(sectorPerformance, null, 2)}
      
      Risk Metrics:
      ${JSON.stringify(riskMetrics, null, 2)}
      
      Please provide:
      1. A summary of the current market conditions
      2. Key technical and fundamental insights
      3. Risk assessment and potential opportunities
      4. Recommendations based on the analysis
    `;

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