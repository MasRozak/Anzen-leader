import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'toyota-anzen-leader-super-secret-jwt-key-2026-production';
const encodedKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'toyota_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: { id: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ['HS256'],
      });
      session = {
        id: payload.id as string,
        role: payload.role as string,
      };
    } catch {
      session = null;
    }
  }

  // 1. Root path handling
  if (pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (session.role === 'ANZEN_LEADER') {
      return NextResponse.redirect(new URL('/anzen/attendance', request.url));
    }
    if (session.role === 'STAFF_INTERNAL') {
      return NextResponse.redirect(new URL('/staff/dashboard', request.url));
    }
  }

  // 2. Login page handling
  if (pathname === '/login') {
    if (session) {
      if (session.role === 'ANZEN_LEADER') {
        return NextResponse.redirect(new URL('/anzen/attendance', request.url));
      }
      if (session.role === 'STAFF_INTERNAL') {
        return NextResponse.redirect(new URL('/staff/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Protected /anzen routes
  if (pathname.startsWith('/anzen')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (session.role !== 'ANZEN_LEADER') {
      return NextResponse.redirect(new URL('/staff/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 4. Protected /staff routes
  if (pathname.startsWith('/staff')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (session.role !== 'STAFF_INTERNAL') {
      return NextResponse.redirect(new URL('/anzen/attendance', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/anzen/:path*', '/staff/:path*'],
};
