import { type NextRequest, NextResponse } from 'next/server'

import { SESSION_COOKIE, verifySession } from '@/shared/lib/session'

export async function proxy(request: NextRequest) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)
  if (!session) return NextResponse.redirect(new URL('/login', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!login|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|icons/|robots.txt|sw.js|images/).*)',
  ],
}
