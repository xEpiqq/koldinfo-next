// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/protected') && !user) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return res;
}
