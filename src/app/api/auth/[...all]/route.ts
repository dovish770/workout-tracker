import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

/**
 * Every Better Auth endpoint — sign-in, the Google callback, sign-out, session
 * lookup — lives behind this one catch-all route.
 */
export const { GET, POST } = toNextJsHandler(auth.handler)
