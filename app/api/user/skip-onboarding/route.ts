import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

// In-memory storage for user status
const userStatusStore = new Map<string, string>();

export async function POST() {
  try {
    // Get session directly
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    userStatusStore.set(userId, 'onboarded');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in skip onboarding route:', error);
    return NextResponse.json(
      { error: 'Failed to skip onboarding' },
      { status: 500 }
    );
  }
} 