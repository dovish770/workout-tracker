import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { SESSION_STATUSES } from '@/features/sessions/constants'
import { user } from './auth-schema'

export const sessionStatus = pgEnum('session_status', SESSION_STATUSES)

export const workouts = pgTable(
  'workouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // Exactly the list page's query: this user's workouts, newest first.
  (table) => [
    index('workouts_user_created_idx').on(table.userId, table.createdAt.desc()),
  ],
)

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

    /**
     * Rest between sets. Stored as plain seconds — the fixed set of choices
     * lives in the UI (`REST_OPTIONS_SECONDS`), so adding one later is a
     * constant change rather than a migration. Null means no timer.
     */
    restSeconds: integer('rest_seconds'),

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

/**
 * A run of a workout: started, worked through set by set, finished.
 *
 * `workout_id` is kept for provenance but the session does not read through
 * it. Everything it displays is copied in at start time (see below).
 */
export const workoutSessions = pgTable(
  'workout_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Nullable and set null on delete: a finished session is a record of what
    // happened, and deleting the template must not erase it.
    workoutId: uuid('workout_id').references(() => workouts.id, {
      onDelete: 'set null',
    }),

    /**
     * Its own column rather than a hop through `workout_id`, which is nullable
     * on purpose: a session outlives the workout it was started from.
     */
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    workoutName: text('workout_name').notNull(),
    status: sessionStatus('status').notNull().default('active'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),

    /** `started_at` plus `SESSION_MAX_HOURS`; past it the session is over. */
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One active session *per user*, enforced in the database rather than in
    // application code where a double click could slip past it. Scoped on
    // `user_id`: keyed on status alone it would let one person's workout block
    // everybody else's.
    uniqueIndex('workout_sessions_single_active_idx')
      .on(table.userId)
      .where(sql`${table.status} = 'active'`),
    index('workout_sessions_started_at_idx').on(table.startedAt),
  ],
)

/**
 * A snapshot of one exercise, taken when the session starts.
 *
 * Deliberately a copy rather than a reference: saving a workout deletes and
 * reinserts its exercise rows, so a foreign key here would cascade away a
 * session's progress on every edit. A log of what you did on Tuesday must not
 * change because you renamed an exercise on Wednesday.
 */
export const sessionExercises = pgTable(
  'session_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    sessionId: uuid('session_id')
      .notNull()
      .references(() => workoutSessions.id, { onDelete: 'cascade' }),

    /** Provenance only — never joined on, and null once the exercise is gone. */
    sourceExerciseId: uuid('source_exercise_id'),

    position: integer('position').notNull(),
    name: text('name').notNull(),
    targetSets: integer('target_sets').notNull(),
    targetReps: integer('target_reps'),
    targetMaxWeight: numeric('target_max_weight', {
      precision: 6,
      scale: 2,
      mode: 'number',
    }),
    restSeconds: integer('rest_seconds'),

    /** How many sets are done. Ticking a set increments; undo decrements. */
    completedSets: integer('completed_sets').notNull().default(0),
  },
  (table) => [
    index('session_exercises_session_position_idx').on(table.sessionId, table.position),
  ],
)

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [workoutSessions.workoutId],
    references: [workouts.id],
  }),
  exercises: many(sessionExercises),
}))

export const sessionExercisesRelations = relations(sessionExercises, ({ one }) => ({
  session: one(workoutSessions, {
    fields: [sessionExercises.sessionId],
    references: [workoutSessions.id],
  }),
}))
