import 'server-only'

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { env } from '@/lib/env'
import * as schema from './schema'

/**
 * The one place a database connection is created.
 *
 * Neon's HTTP driver is stateless, so this module-scope singleton holds no
 * socket — it is reused across requests without pooling concerns.
 */
const sql = neon(env.DATABASE_URL)

export const db = drizzle({ client: sql, schema })
