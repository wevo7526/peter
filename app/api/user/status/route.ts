import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

// In-memory storage for user status
const userStatusStore = new Map<string, string>();

export async function GET(request: Request) {
  try {
    // Initialize cookies first
    const cookieStore = await cookies();
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const status = userStatusStore.get(userId);
    
    return NextResponse.json({ 
      hasCompletedOnboarding: status === 'onboarded',
      status: status || 'active' 
    });
  } catch (error) {
    console.error('Error in user status route:', error);
    return NextResponse.json(
      { error: 'Failed to get user status' },
      { status: 500 }
    );
  }
} 