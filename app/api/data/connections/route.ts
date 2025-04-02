import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

// Define types for data sources and connections
interface DataSource {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdated: string;
}

interface DataConnection {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  lastSynced?: string;
  dataSources: string[];
}

// Mock data for data sources
const mockDataSources: DataSource[] = [
  {
    id: 'ds-1',
    name: 'Stock Market Data',
    type: 'market_data',
    description: 'Real-time stock market data from major exchanges',
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ds-2',
    name: 'Financial News',
    type: 'news',
    description: 'Financial news and analysis from trusted sources',
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ds-3',
    name: 'Economic Indicators',
    type: 'economic_data',
    description: 'Key economic indicators and statistics',
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
];

// Mock data for connections
const mockConnections: DataConnection[] = [
  {
    id: 'conn-1',
    name: 'Market Data Connection',
    provider: 'Financial Data API',
    status: 'active',
    lastSynced: new Date().toISOString(),
    dataSources: ['Stock Market Data', 'Economic Indicators'],
  },
  {
    id: 'conn-2',
    name: 'News Feed',
    provider: 'News API',
    status: 'inactive',
    dataSources: ['Financial News'],
  },
];

export async function GET(request: Request) {
  try {
    // Initialize cookies first
    const cookieStore = await cookies();
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    
    // Return mock data instead of fetching from Redis
    return NextResponse.json(mockConnections);
  } catch (error) {
    console.error('Error in data connections route:', error);
    return NextResponse.json(
      { error: 'Failed to get data connections' },
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
    
    if (!body.name || !body.provider) {
      return NextResponse.json(
        { error: 'Name and provider are required' },
        { status: 400 }
      );
    }
    
    // Create a new connection
    const newConnection: DataConnection = {
      id: `conn-${Date.now()}`,
      name: body.name,
      provider: body.provider,
      status: 'inactive',
      dataSources: body.dataSources || [],
    };
    
    // In a real implementation, you would store this in a database
    // For now, we'll just return the new connection
    
    return NextResponse.json({ connection: newConnection });
  } catch (error) {
    console.error('Error in data connections POST route:', error);
    return NextResponse.json(
      { error: 'Failed to create data connection' },
      { status: 500 }
    );
  }
} 