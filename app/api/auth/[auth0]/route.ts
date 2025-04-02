import { NextRequest, NextResponse } from 'next/server';
import { handleAuth } from '@auth0/nextjs-auth0';

// Create a handler for Auth0 authentication
const handler = handleAuth();

export async function GET(req: NextRequest, { params }: { params: { auth0: string } }) {
  try {
    // Ensure params are properly awaited
    const auth0Param = params.auth0;

    // Call the handler with the request and context
    return await handler(req, { params: { auth0: auth0Param } });
  } catch (error) {
    console.error('Auth0 handler error:', error);
    return new Response(JSON.stringify({ error: 'Authentication error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(req: NextRequest, { params }: { params: { auth0: string } }) {
  try {
    // Ensure params are properly awaited
    const auth0Param = params.auth0;

    // Call the handler with the request and context
    return await handler(req, { params: { auth0: auth0Param } });
  } catch (error) {
    console.error('Auth0 handler error:', error);
    return new Response(JSON.stringify({ error: 'Authentication error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 