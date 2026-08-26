import { z } from 'zod'

/**
 * Validated server-side environment.
 *
 * Variables are read one by one rather than spreading `process.env`, because
 * the bundler only inlines statically referenced keys.
 *
 * A missing or malformed `DATABASE_URL` fails here, at import time, instead of
 * surfacing as an opaque driver error on the first query.
 */
const envSchema = z.object({
  DATABASE_URL: z.url(),
})

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
})

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`)
}

export const env = parsed.data
