import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only run on client-side navigation
  if (request.headers.get('user-agent')?.includes('Googlebot')) {
    return NextResponse.next()
  }

  // Check if it's a mobile device using viewport width
  const viewport = request.headers.get('viewport-width')
  const isMobile = viewport ? parseInt(viewport) <= 768 : false

  // If mobile and not on home page, redirect to home
  if (isMobile && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 