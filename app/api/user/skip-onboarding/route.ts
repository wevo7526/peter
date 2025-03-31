import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import client from '@/lib/redis';

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a placeholder onboarding status
    await client.hSet(`user:${session.user.sub}:onboarding`, 'personal', JSON.stringify({
      skipped: true,
      timestamp: new Date().toISOString()
    }));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error skipping onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to skip onboarding' },
      { status: 500 }
    );
  }
} 