import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Cascade: a workout's exercises have no meaning without it, and deleting
    // them belongs to the database rather than to application code.
    workoutId: uuid('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),

    /**
     * Order within the workout, zero-based.
     *
     * Deliberately *not* unique per workout: reordering passes through states
     * where two rows briefly share a position, and a unique constraint would
     * abort the save halfway through.
     */
    position: integer('position').notNull(),

    name: text('name').notNull(),
    sets: integer('sets').notNull(),
    reps: integer('reps'),

    // Weights are fractional (102.5 kg) but must not drift, so numeric rather
    // than a float — read back as a JS number.
    maxWeight: numeric('max_weight', { precision: 6, scale: 2, mode: 'number' }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('exercises_workout_position_idx').on(table.workoutId, table.position),
  ],
)

export const workoutsRelations = relations(workouts, ({ many }) => ({
  exercises: many(exercises),
}))

export const exercisesRelations = relations(exercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
}))
