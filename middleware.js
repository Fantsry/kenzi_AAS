import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'dev-secret-very-long-random-1234567890!@#' })
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ['/', '/login', '/registration', '/api/auth', '/api/cron']
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // API routes - check in route handlers
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin-only routes
  const adminRoutes = ['/admin']
  if (adminRoutes.some(route => pathname.startsWith(route)) && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

