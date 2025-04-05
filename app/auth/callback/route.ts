import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      // Exchange the code for a session
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Error exchanging code for session:', sessionError);
        return NextResponse.redirect(new URL('/auth', request.url));
      }

      if (session?.user) {
        // Check if this is a new user by looking for their profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking user profile:', profileError);
          return NextResponse.redirect(new URL('/auth', request.url));
        }

        // If no profile exists, this is a new user - create profile and redirect to onboarding
        if (!profile) {
          // Create an initial profile for the user
          const { error: createProfileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: session.user.id,
              email: session.user.email,
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (createProfileError) {
            console.error('Error creating user profile:', createProfileError);
            return NextResponse.redirect(new URL('/auth', request.url));
          }

          return NextResponse.redirect(new URL('/onboarding/personal', request.url));
        }

        // For existing users, always redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Error in callback route:', error);
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // If something went wrong, redirect to auth page
  return NextResponse.redirect(new URL('/auth', request.url));
} 