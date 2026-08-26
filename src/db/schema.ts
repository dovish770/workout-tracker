import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { Exercise } from '@/features/workouts/schema'

/**
 * The only table.
 *
 * Exercises live in a JSONB column rather than a child table: they are always
 * read and written together with their workout, and their array order is the
 * display order, so a join and a position column would both be dead weight.
 */
export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  exercises: jsonb('exercises').$type<Exercise[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
