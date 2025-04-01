import { NextResponse } from 'next/server';
import { generatePortfolioRecommendations } from '@/app/services/portfolioAgent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const recommendations = await generatePortfolioRecommendations(body);
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating portfolio recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate portfolio recommendations' },
      { status: 500 }
    );
  }
} 