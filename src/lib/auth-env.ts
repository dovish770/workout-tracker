import { z } from 'zod'

/**
 * Environment for authentication, validated separately from `lib/env.ts`.
 *
 * Kept apart on purpose: `lib/env.ts` is imported by the database client and
 * therefore by nearly every server file, so making these required there would
 * take the whole app down until they are configured. Here the strictness lands
 * exactly where it belongs — the first thing that actually needs them.
 */
const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  /** The deployment's own origin, used to build OAuth callback URLs. */
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
})

const parsed = authEnvSchema.safeParse({
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
})

if (!parsed.success) {
  throw new Error(
    `Authentication is not configured.\n${z.prettifyError(parsed.error)}\n` +
      'See .env.example — these are set locally in .env and in the Vercel project settings.',
  )
}

export const authEnv = parsed.data
