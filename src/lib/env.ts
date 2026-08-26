import { z } from 'zod'

/**
 * Validated server-side environment.
 *
 * Variables are read one by one rather than spreading `process.env`, because
 * the bundler only inlines statically referenced keys.
 *
 * `DATABASE_URL` is optional until Neon is wired in (stage 2); at that point
 * `.optional()` is removed and a missing URL fails the build loudly instead of
 * surfacing as a runtime crash on the first query.
 */
const envSchema = z.object({
  DATABASE_URL: z.url().optional(),
})

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
})

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`)
}

export const env = parsed.data
