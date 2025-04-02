import { NextResponse } from 'next/server';
import { generatePortfolioRecommendations } from '@/app/services/portfolioAgent';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Initialize cookies first
    const cookieStore = await cookies();
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = session.user.sub;
    
    // Generate recommendations without caching
    const recommendations = await generatePortfolioRecommendations({
      age: parseInt(body.age) || 30,
      income: parseInt(body.income) || 50000,
      goals: body.goals || 'retirement',
      riskTolerance: body.riskTolerance || 'moderate',
      timeHorizon: parseInt(body.timeHorizon) || 20,
      query: body.query || '',
    });
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating portfolio recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate portfolio recommendations' },
      { status: 500 }
    );
  }
} 