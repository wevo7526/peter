import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

// Mock data for demonstration
const mockPersonalData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, Anytown, USA',
  dateOfBirth: '1990-01-01',
  employmentStatus: 'employed',
  occupation: 'Software Engineer',
  annualIncome: 100000,
  maritalStatus: 'single',
  dependents: 0,
};

export async function POST(request: Request) {
  try {
    // Initialize cookies first
    const cookieStore = await cookies();
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.sub;
    
    // In a real implementation, you would store this in a database
    // For now, we'll just return a success message
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving personal information:', error);
    return NextResponse.json(
      { error: 'Failed to save personal information' },
      { status: 500 }
    );
  }
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
    
    // Return mock data instead of fetching from Redis
    return NextResponse.json(mockPersonalData);
  } catch (error) {
    console.error('Error fetching personal information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal information' },
      { status: 500 }
    );
  }
} 