import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return a success message without testing Redis
    return NextResponse.json({ 
      success: true, 
      message: 'Redis is disabled',
      testValue: 'Redis is not being used'
    });
  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 