import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import client from '@/lib/redis';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await client.hGet(`user:${session.user.sub}:onboarding`, 'personal');
    
    return NextResponse.json({
      hasCompletedOnboarding: !!userData
    });
  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { error: 'Failed to check user status' },
      { status: 500 }
    );
  }
} 