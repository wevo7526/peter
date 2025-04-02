import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Simple rate limiting without Redis
  // This is a basic implementation that doesn't persist between requests
  // For a production app, you would want to implement a more robust solution
  
  // Get IP from headers or fallback to localhost
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
  
  // In a real implementation, you would track this in memory or use a different storage solution
  // For now, we'll just allow all requests
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}; 