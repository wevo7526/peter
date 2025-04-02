import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

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
    // Initialize cookies first
    const cookieStore = await cookies();
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    
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
    const isLimited = await isRateLimited(`research:save:${userId}`, 10, 60);
    if (isLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Create a new saved query
    const newQuery: SavedQuery = {
      id: uuidv4(),
      query: body.query,
      timestamp: new Date().toISOString(),
    };
    
    // Store in memory
    savedQueriesStore.set(newQuery.id, newQuery);
    
    return NextResponse.json({ query: newQuery });
  } catch (error) {
    console.error('Error in research POST route:', error);
    return NextResponse.json(
      { error: 'Failed to save research query' },
      { status: 500 }
    );
  }
} 