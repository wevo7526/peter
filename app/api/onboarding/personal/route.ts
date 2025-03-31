import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import redis from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.sub;

    // Store personal information in Redis
    await redis.hset(
      `user:${userId}:onboarding`,
      'personal',
      JSON.stringify(data)
    );

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
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;

    // Get personal information from Redis
    const data = await redis.hget(`user:${userId}:onboarding`, 'personal');

    return NextResponse.json(data ? JSON.parse(data) : null);
  } catch (error) {
    console.error('Error fetching personal information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal information' },
      { status: 500 }
    );
  }
} 