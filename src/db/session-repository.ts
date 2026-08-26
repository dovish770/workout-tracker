import 'server-only'

import { and, eq, sql } from 'drizzle-orm'
import type { SessionStatus } from '@/features/sessions/constants'
import type { WorkoutSession } from '@/features/sessions/types'
import { db } from './client'
import { sessionExercises, workoutSessions, workouts } from './schema'

/**
 * The data-access boundary for sessions. Same rule as `repository.ts`:
 * nothing above this file knows Drizzle exists.
 */
export interface SessionRepository {
  getActive(): Promise<WorkoutSession | null>
  getById(id: string): Promise<WorkoutSession | null>
  /** Snapshots the workout into a new session. Null when the workout is gone. */
  start(workoutId: string): Promise<WorkoutSession | null>
  completeSet(
    sessionId: string,
    sessionExerciseId: string,
  ): Promise<WorkoutSession | null>
  undoSet(sessionId: string, sessionExerciseId: string): Promise<WorkoutSession | null>
  finish(sessionId: string, status: SessionStatus): Promise<WorkoutSession | null>
}

const SESSION_EXERCISE_COLUMNS = {
  id: true,
  position: true,
  name: true,
  targetSets: true,
  targetReps: true,
  targetMaxWeight: true,
  restSeconds: true,
  completedSets: true,
} as const

function findSession(id: string) {
  return db.query.workoutSessions.findFirst({
    where: eq(workoutSessions.id, id),
    columns: {
      id: true,
      workoutId: true,
      workoutName: true,
      status: true,
      startedAt: true,
      completedAt: true,
    },
    with: {
      exercises: {
        columns: SESSION_EXERCISE_COLUMNS,
        orderBy: (exercise, { asc }) => [asc(exercise.position)],
      },
    },
  })
}

/**
 * Moves the counter for one exercise, clamped to its bounds inside SQL.
 *
 * The arithmetic has to happen in the database: two quick taps would otherwise
 * both read the same value and the second would undo the first, and a clamp in
 * JavaScript could be raced past the target.
 */
async function moveSetCounter(
  sessionId: string,
  sessionExerciseId: string,
  direction: 1 | -1,
): Promise<WorkoutSession | null> {
  const [session] = await db
    .select({ id: workoutSessions.id })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.status, 'active')))
    .limit(1)

  if (!session) return null

  const nextValue =
    direction === 1
      ? sql`least(${sessionExercises.completedSets} + 1, ${sessionExercises.targetSets})`
      : sql`greatest(${sessionExercises.completedSets} - 1, 0)`

  await db
    .update(sessionExercises)
    .set({ completedSets: nextValue })
    .where(
      and(
        eq(sessionExercises.id, sessionExerciseId),
        eq(sessionExercises.sessionId, sessionId),
      ),
    )

  return (await findSession(sessionId)) ?? null
}

export const sessionRepository: SessionRepository = {
  async getActive() {
    const session = await db.query.workoutSessions.findFirst({
      where: eq(workoutSessions.status, 'active'),
      columns: {
        id: true,
        workoutId: true,
        workoutName: true,
        status: true,
        startedAt: true,
        completedAt: true,
      },
      with: {
        exercises: {
          columns: SESSION_EXERCISE_COLUMNS,
          orderBy: (exercise, { asc }) => [asc(exercise.position)],
        },
      },
    })

    return session ?? null
  },

  async getById(id) {
    return (await findSession(id)) ?? null
  },

  async start(workoutId) {
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.id, workoutId),
      columns: { id: true, name: true },
      with: {
        exercises: {
          columns: {
            id: true,
            name: true,
            sets: true,
            reps: true,
            maxWeight: true,
            restSeconds: true,
          },
          orderBy: (exercise, { asc }) => [asc(exercise.position)],
        },
      },
    })

    if (!workout || workout.exercises.length === 0) return null

    const sessionId = crypto.randomUUID()

    // One transaction: a session without its exercises would be unusable, and
    // the partial unique index rejects a second active session here.
    await db.batch([
      db.insert(workoutSessions).values({
        id: sessionId,
        workoutId: workout.id,
        workoutName: workout.name,
      }),
      db.insert(sessionExercises).values(
        workout.exercises.map((exercise, index) => ({
          sessionId,
          sourceExerciseId: exercise.id,
          position: index,
          name: exercise.name,
          targetSets: exercise.sets,
          targetReps: exercise.reps,
          targetMaxWeight: exercise.maxWeight,
          restSeconds: exercise.restSeconds,
        })),
      ),
    ])

    return (await findSession(sessionId)) ?? null
  },

  completeSet(sessionId, sessionExerciseId) {
    return moveSetCounter(sessionId, sessionExerciseId, 1)
  },

  undoSet(sessionId, sessionExerciseId) {
    return moveSetCounter(sessionId, sessionExerciseId, -1)
  },

  async finish(sessionId, status) {
    const [updated] = await db
      .update(workoutSessions)
      .set({
        status,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      // Only an active session can be finished, so a double submit is a no-op
      // rather than a second, later `completed_at`.
      .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.status, 'active')))
      .returning({ id: workoutSessions.id })

    if (!updated) return null

    return (await findSession(sessionId)) ?? null
  },
}
