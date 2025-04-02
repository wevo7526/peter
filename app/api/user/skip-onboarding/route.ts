import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Initialize cookies first
    const cookieStore = await cookies();
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    
    // In a real implementation, you would update the user status in a database
    // For now, we'll just return a success message
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in skip-onboarding route:', error);
    return NextResponse.json(
      { error: 'Failed to skip onboarding' },
      { status: 500 }
    );
  }
} 