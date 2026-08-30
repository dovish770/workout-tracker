import 'server-only'

import { and, count, desc, eq } from 'drizzle-orm'
import type {
  Exercise,
  Workout,
  WorkoutInput,
  WorkoutSummary,
} from '@/features/workouts/schema'
import { db } from './client'
import { exercises, workouts } from './schema'

/**
 * The data-access boundary.
 *
 * Everything above this line — queries, actions, UI — depends on this
 * interface and never on Drizzle, so reshaping the storage model stays
 * contained to this file.
 */
export interface WorkoutRepository {
  list(): Promise<WorkoutSummary[]>
  getById(id: string): Promise<Workout | null>
  create(input: WorkoutInput): Promise<Workout>
  update(id: string, input: WorkoutInput): Promise<Workout | null>
  remove(id: string): Promise<boolean>
}

/** The exercise columns that make up the domain type — no storage bookkeeping. */
const EXERCISE_COLUMNS = {
  id: true,
  name: true,
  sets: true,
  reps: true,
  maxWeight: true,
  restSeconds: true,
} as const

/** Array order is still the source of truth for order; it becomes `position` here. */
function toExerciseRows(workoutId: string, list: Exercise[]) {
  return list.map((exercise, index) => ({
    id: exercise.id,
    workoutId,
    position: index,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    maxWeight: exercise.maxWeight,
    restSeconds: exercise.restSeconds,
  }))
}

/**
 * Builds a repository bound to one user.
 *
 * The owner is closed over rather than passed per call, so there is no API
 * here that can read or write another user's workouts — forgetting the filter
 * is not something a caller is able to do. Nothing above this file ever sees a
 * user id in a repository signature.
 */
export function createWorkoutRepository(userId: string): WorkoutRepository {
  function findById(id: string) {
    return db.query.workouts.findFirst({
      where: and(eq(workouts.id, id), eq(workouts.userId, userId)),
      with: {
        exercises: {
          columns: EXERCISE_COLUMNS,
          orderBy: (exercise, { asc }) => [asc(exercise.position)],
        },
      },
    })
  }

  return {
    list() {
      return (
        db
          .select({
            id: workouts.id,
            name: workouts.name,
            description: workouts.description,
            createdAt: workouts.createdAt,
            updatedAt: workouts.updatedAt,
            exerciseCount: count(exercises.id),
          })
          .from(workouts)
          // Left join, so a workout with no exercises still appears, with a zero.
          .leftJoin(exercises, eq(exercises.workoutId, workouts.id))
          .where(eq(workouts.userId, userId))
          .groupBy(workouts.id)
          // `id` breaks ties: workouts created in one statement share a timestamp
          // to the microsecond, and without a tiebreaker their order can differ
          // between two identical queries.
          .orderBy(desc(workouts.createdAt), desc(workouts.id))
      )
    },

    async getById(id) {
      // Someone else's workout is indistinguishable from one that is not there.
      // Returning 404 rather than 403 keeps its existence private.
      return (await findById(id)) ?? null
    },

    async create(input) {
      // The id is minted here rather than read back from an insert, so both
      // statements can go out together.
      const workoutId = crypto.randomUUID()

      // Neon's HTTP driver has no interactive transactions; `batch` sends these
      // as one transaction in a single round trip.
      await db.batch([
        db.insert(workouts).values({
          id: workoutId,
          userId,
          name: input.name,
          description: input.description,
        }),
        db.insert(exercises).values(toExerciseRows(workoutId, input.exercises)),
      ])

      const created = await findById(workoutId)
      if (!created) throw new Error(`workout ${workoutId} vanished right after insert`)

      return created
    },

    async update(id, input) {
      // Ownership is part of every predicate below, so this is a "does it exist
      // and is it mine" check rather than a separate authorisation step that
      // could go stale between the read and the write.
      const [existing] = await db
        .select({ id: workouts.id })
        .from(workouts)
        .where(and(eq(workouts.id, id), eq(workouts.userId, userId)))
        .limit(1)

      if (!existing) return null

      // Replace rather than diff: the payload is the complete list, and rows
      // keep the ids they arrived with, so this is not a churn of identities.
      await db.batch([
        db
          .update(workouts)
          .set({
            name: input.name,
            description: input.description,
            updatedAt: new Date(),
          })
          .where(and(eq(workouts.id, id), eq(workouts.userId, userId))),
        db.delete(exercises).where(eq(exercises.workoutId, id)),
        db.insert(exercises).values(toExerciseRows(id, input.exercises)),
      ])

      return (await findById(id)) ?? null
    },

    async remove(id) {
      // Exercises go with it through the cascade on the foreign key.
      const deleted = await db
        .delete(workouts)
        .where(and(eq(workouts.id, id), eq(workouts.userId, userId)))
        .returning({ id: workouts.id })

      return deleted.length > 0
    },
  }
}
