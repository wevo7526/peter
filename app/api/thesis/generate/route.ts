import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';
import { generateInvestmentThesis } from '@/app/services/thesisAgent';

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Generate thesis using the thesis agent
    const thesis = await generateInvestmentThesis(query);

    return NextResponse.json(thesis);
  } catch (error) {
    console.error('Error generating thesis:', error);
    return NextResponse.json(
      { error: 'Failed to generate investment thesis' },
      { status: 500 }
    );
  }
} 