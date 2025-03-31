import { NextResponse } from 'next/server';
import client from '@/lib/redis';

export async function GET() {
  try {
    // Test Redis connection
    await client.set('test', 'Hello Redis!');
    const result = await client.get('test');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Redis connection successful',
      testValue: result 
    });
  } catch (error) {
    console.error('Redis connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to Redis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 