import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

// Define data connection interface
interface DataConnection {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  lastSynced?: string;
  dataSources: any[];
}

// Mock data for demonstration
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get session directly
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const connectionId = params.id;
    
    // Find the connection in mock data
    const connection = mockConnections.find(conn => conn.id === connectionId);
    
    if (connection) {
      return NextResponse.json(connection);
    }
    
    // Return error if connection not found
    return NextResponse.json(
      { error: 'Connection not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in data connection route:', error);
    return NextResponse.json(
      { error: 'Failed to get data connection' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get session directly
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const connectionId = params.id;
    const body = await request.json();
    
    // Find the connection in mock data
    const connectionIndex = mockConnections.findIndex(conn => conn.id === connectionId);
    
    if (connectionIndex !== -1) {
      // Update the connection
      const updatedConnection = {
        ...mockConnections[connectionIndex],
        ...body,
        id: connectionId, // Ensure ID doesn't change
      };
      
      // In a real implementation, you would store this in a database
      // For now, we'll just return the updated connection
      
      return NextResponse.json(updatedConnection);
    }
    
    // Return error if connection not found
    return NextResponse.json(
      { error: 'Connection not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in data connection PATCH route:', error);
    return NextResponse.json(
      { error: 'Failed to update data connection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get session directly
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const connectionId = params.id;
    
    // Find the connection in mock data
    const connectionIndex = mockConnections.findIndex(conn => conn.id === connectionId);
    
    if (connectionIndex !== -1) {
      // In a real implementation, you would delete this from a database
      // For now, we'll just return a success message
      
      return NextResponse.json({ success: true });
    }
    
    // Return error if connection not found
    return NextResponse.json(
      { error: 'Connection not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in data connection DELETE route:', error);
    return NextResponse.json(
      { error: 'Failed to delete data connection' },
      { status: 500 }
    );
  }
} 