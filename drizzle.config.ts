import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

// drizzle-kit runs outside Next.js, which is what loads `.env` for the app.
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing. Copy .env.example to .env and fill it in.')
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
})
