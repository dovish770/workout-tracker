import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'
import { auth } from '@/lib/auth'

export interface CurrentUser {
  id: string
  name: string
  email: string
  image: string | null
}

/**
 * The signed-in user, or null.
 *
 * Memoized per request: the layout, the page and every repository factory ask
 * for it, and without this each one would re-read and re-verify the session.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  const { id, name, email, image } = session.user
  return { id, name, email, image: image ?? null }
})
