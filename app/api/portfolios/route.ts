import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received portfolio data:', body);

    const { 
      name, 
      description, 
      positions, 
      risk_profile, 
      target_allocation, 
      total_value, 
      expected_return, 
      volatility, 
      sharpe_ratio, 
      recommendations,
      performance 
    } = body;

    // Validate required fields
    if (!name || !description || !risk_profile || !target_allocation) {
      console.error('Missing required fields:', { name, description, risk_profile, target_allocation });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create portfolio with all fields
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .insert([
        {
          user_id: user.id,
          name,
          description,
          positions: positions || [],
          risk_profile,
          target_allocation,
          total_value: total_value || 0,
          expected_return: expected_return || 0,
          volatility: volatility || 0,
          sharpe_ratio: sharpe_ratio || 0,
          recommendations: recommendations || [],
          performance: performance || {
            daily: 0,
            weekly: 0,
            monthly: 0,
            yearly: 0,
            allTime: 0
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (portfolioError) {
      console.error('Portfolio creation error:', {
        message: portfolioError.message,
        details: portfolioError.details,
        hint: portfolioError.hint,
        code: portfolioError.code
      });
      return NextResponse.json(
        { error: 'Failed to create portfolio', details: portfolioError.message },
        { status: 500 }
      );
    }

    if (!portfolio) {
      return NextResponse.json(
        { error: 'No data returned from database' },
        { status: 500 }
      );
    }

    console.log('Successfully created portfolio:', portfolio);
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Portfolio creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    // Get portfolios for the user
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolios:', error);
      return NextResponse.json(
        { error: 'Failed to fetch portfolios', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in portfolio fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 