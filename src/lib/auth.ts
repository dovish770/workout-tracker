import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db/client'
import * as authSchema from '@/db/auth-schema'
import { authEnv } from './auth-env'

/**
 * The authentication server.
 *
 * Google is the only sign-in method: email and password would quietly drag in
 * an email service for verification and resets, and one tap beats a password
 * on a phone in a gym. Adding methods later is configuration, not migration.
 */
export const auth = betterAuth({
  secret: authEnv.BETTER_AUTH_SECRET,
  baseURL: authEnv.BETTER_AUTH_URL,

  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),

  socialProviders: {
    google: {
      clientId: authEnv.GOOGLE_CLIENT_ID,
      clientSecret: authEnv.GOOGLE_CLIENT_SECRET,
    },
  },

  // Lets server actions set the session cookie; without it a sign-in on the
  // server never reaches the browser.
  plugins: [nextCookies()],
})
