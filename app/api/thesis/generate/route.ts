import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { generateInvestmentThesis } from '@/app/services/thesisAgent';

export async function POST(request: Request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.headers.get('cookie')?.split('; ').find(c => c.startsWith(`${name}=`))?.split('=')[1];
          },
          set(name: string, value: string, options: CookieOptions) {
            // Server-side cookies are handled by the middleware
          },
          remove(name: string, options: CookieOptions) {
            // Server-side cookies are handled by the middleware
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
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