import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateInvestmentThesis } from '@/app/services/thesisAgent';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const thesis = await generateInvestmentThesis(body.query);

    return NextResponse.json(thesis);
  } catch (error) {
    console.error('Error generating thesis:', error);
    return NextResponse.json(
      { error: 'Failed to generate thesis' },
      { status: 500 }
    );
  }
} 