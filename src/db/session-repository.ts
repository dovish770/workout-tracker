import 'server-only'

import { and, eq, sql } from 'drizzle-orm'
import type { SessionStatus } from '@/features/sessions/constants'
import { SESSION_MAX_HOURS } from '@/features/sessions/constants'
import type { WorkoutSession } from '@/features/sessions/types'
import { db } from './client'
import { exercises, sessionExercises, workoutSessions, workouts } from './schema'

/**
 * The data-access boundary for sessions. Same rule as `repository.ts`:
 * nothing above this file knows Drizzle exists, and the owner is closed over
 * so no call site can reach another user's data.
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
  /** Writes a new personal best back to the workout as well as the session. */
  setMaxWeight(
    sessionId: string,
    sessionExerciseId: string,
    maxWeight: number | null,
  ): Promise<WorkoutSession | null>
}

const SESSION_COLUMNS = {
  id: true,
  workoutId: true,
  workoutName: true,
  status: true,
  startedAt: true,
  expiresAt: true,
  completedAt: true,
} as const

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

export function createSessionRepository(userId: string): SessionRepository {
  function findSession(id: string) {
    return db.query.workoutSessions.findFirst({
      where: and(eq(workoutSessions.id, id), eq(workoutSessions.userId, userId)),
      columns: SESSION_COLUMNS,
      with: {
        exercises: {
          columns: SESSION_EXERCISE_COLUMNS,
          orderBy: (exercise, { asc }) => [asc(exercise.position)],
        },
      },
    })
  }

  /**
   * Closes a session that has run past its limit, at the moment anyone looks.
   *
   * Deliberately lazy rather than a scheduled job: while an expired session
   * still reads as `active`, the partial unique index counts it, and the user
   * can never start another one. A cron would fix that eventually; this fixes
   * it exactly when it matters. `completed_at` records when it actually ran
   * out, not when we noticed.
   */
  async function expireIfElapsed(
    session: WorkoutSession,
  ): Promise<WorkoutSession | null> {
    if (session.status !== 'active' || session.expiresAt > new Date()) return session

    await db
      .update(workoutSessions)
      .set({
        status: 'expired',
        completedAt: session.expiresAt,
        updatedAt: new Date(),
      })
      .where(
        and(eq(workoutSessions.id, session.id), eq(workoutSessions.status, 'active')),
      )

    return { ...session, status: 'expired', completedAt: session.expiresAt }
  }

  /** Moves the counter for one exercise, clamped to its bounds inside SQL. */
  async function moveSetCounter(
    sessionId: string,
    sessionExerciseId: string,
    direction: 1 | -1,
  ): Promise<WorkoutSession | null> {
    const current = await findSession(sessionId)
    if (!current) return null

    const live = await expireIfElapsed(current)
    if (!live || live.status !== 'active') return null

    /*
     * The arithmetic happens in the database: two quick taps would otherwise
     * both read the same value and the second would undo the first, and a
     * clamp in JavaScript could be raced past the target.
     */
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

  return {
    async getActive() {
      const session = await db.query.workoutSessions.findFirst({
        where: and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.status, 'active'),
        ),
        columns: SESSION_COLUMNS,
        with: {
          exercises: {
            columns: SESSION_EXERCISE_COLUMNS,
            orderBy: (exercise, { asc }) => [asc(exercise.position)],
          },
        },
      })

      if (!session) return null

      const live = await expireIfElapsed(session)
      return live?.status === 'active' ? live : null
    },

    async getById(id) {
      const session = await findSession(id)
      if (!session) return null

      return expireIfElapsed(session)
    },

    async start(workoutId) {
      const workout = await db.query.workouts.findFirst({
        // Scoped: starting someone else's workout is not possible.
        where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
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
      const startedAt = new Date()
      const expiresAt = new Date(startedAt.getTime() + SESSION_MAX_HOURS * 60 * 60 * 1000)

      // One transaction: a session without its exercises would be unusable, and
      // the partial unique index rejects a second active session here.
      await db.batch([
        db.insert(workoutSessions).values({
          id: sessionId,
          userId,
          workoutId: workout.id,
          workoutName: workout.name,
          startedAt,
          expiresAt,
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
        .set({ status, completedAt: new Date(), updatedAt: new Date() })
        // Ownership and "still active" in one predicate, so a double submit is
        // a no-op rather than a second, later `completed_at`.
        .where(
          and(
            eq(workoutSessions.id, sessionId),
            eq(workoutSessions.userId, userId),
            eq(workoutSessions.status, 'active'),
          ),
        )
        .returning({ id: workoutSessions.id })

      if (!updated) return null

      return (await findSession(sessionId)) ?? null
    },

    async setMaxWeight(sessionId, sessionExerciseId, maxWeight) {
      // Joined back to the session so ownership is checked in the same read.
      const [snapshot] = await db
        .select({ sourceExerciseId: sessionExercises.sourceExerciseId })
        .from(sessionExercises)
        .innerJoin(
          workoutSessions,
          and(
            eq(workoutSessions.id, sessionExercises.sessionId),
            eq(workoutSessions.userId, userId),
          ),
        )
        .where(
          and(
            eq(sessionExercises.id, sessionExerciseId),
            eq(sessionExercises.sessionId, sessionId),
          ),
        )
        .limit(1)

      if (!snapshot) return null

      const updateSnapshot = () =>
        db
          .update(sessionExercises)
          .set({ targetMaxWeight: maxWeight })
          .where(eq(sessionExercises.id, sessionExerciseId))

      /*
       * The one write that crosses the snapshot line on purpose. Everywhere
       * else the session is insulated from the workout; here a new personal
       * best is a fact about the exercise itself, not just about today, so it
       * goes back to the template too — scoped to this owner, and skipped
       * entirely if that exercise has since been deleted.
       */
      if (snapshot.sourceExerciseId) {
        await db.batch([
          updateSnapshot(),
          db
            .update(exercises)
            .set({ maxWeight, updatedAt: new Date() })
            .where(eq(exercises.id, snapshot.sourceExerciseId)),
        ])
      } else {
        await updateSnapshot()
      }

      return (await findSession(sessionId)) ?? null
    },
  }
}
