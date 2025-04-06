import { NextResponse } from 'next/server';
import { generatePortfolioRecommendations } from '@/app/services/portfolioAgent';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Set the session
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
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