import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/lib/routes'

/**
 * Sends signed-out visitors to the login screen before a protected page
 * renders — a redirect, not the security boundary.
 *
 * Next's docs note this may be deployed to a CDN and must not rely on shared
 * modules, so it only checks that a session cookie is present; it does not
 * verify it. The real enforcement is `requireUser()` inside the repository
 * factories, which nothing can reach around.
 *
 * `middleware.ts` was deprecated in Next 16 and renamed to this file.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next()

  const loginUrl = new URL(ROUTES.auth.login, request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/workouts/:path*', '/sessions/:path*'],
}
