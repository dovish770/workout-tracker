import 'server-only'

import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { getCurrentUser, type CurrentUser } from './queries'

/**
 * The signed-in user, or off to the login screen.
 *
 * Every repository is built from this, so an unauthenticated request cannot
 * reach a query at all. `redirect` throws, so call it before any try/catch
 * that would otherwise swallow the navigation.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.auth.login)

  return user
}
