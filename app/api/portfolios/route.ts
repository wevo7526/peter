import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { name, description, positions, riskProfile, targetAllocation } = await request.json();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Save the portfolio
    const { data, error } = await supabase
      .from('portfolios')
      .insert([
        {
          user_id: user.id,
          name,
          description,
          positions,
          risk_profile: riskProfile,
          target_allocation: targetAllocation,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving portfolio:', error);
      return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in portfolio creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's portfolios
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolios:', error);
      return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in portfolio retrieval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 