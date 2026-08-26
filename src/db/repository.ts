import 'server-only'

import { count, desc, eq } from 'drizzle-orm'
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

function findById(id: string) {
  return db.query.workouts.findFirst({
    where: eq(workouts.id, id),
    with: {
      exercises: {
        columns: EXERCISE_COLUMNS,
        orderBy: (exercise, { asc }) => [asc(exercise.position)],
      },
    },
  })
}

export const workoutRepository: WorkoutRepository = {
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
        .groupBy(workouts.id)
        // `id` breaks ties: workouts created in one statement share a timestamp
        // to the microsecond, and without a tiebreaker their order can differ
        // between two identical queries.
        .orderBy(desc(workouts.createdAt), desc(workouts.id))
    )
  },

  async getById(id) {
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
    // Checked up front: without it a missing workout would surface as a
    // foreign-key violation from the insert rather than as "not found".
    const [existing] = await db
      .select({ id: workouts.id })
      .from(workouts)
      .where(eq(workouts.id, id))
      .limit(1)

    if (!existing) return null

    // Replace rather than diff: the payload is the complete list, and rows
    // keep the ids they arrived with, so this is not a churn of identities.
    await db.batch([
      db
        .update(workouts)
        .set({ name: input.name, description: input.description, updatedAt: new Date() })
        .where(eq(workouts.id, id)),
      db.delete(exercises).where(eq(exercises.workoutId, id)),
      db.insert(exercises).values(toExerciseRows(id, input.exercises)),
    ])

    return (await findById(id)) ?? null
  },

  async remove(id) {
    // Exercises go with it through the cascade on the foreign key.
    const deleted = await db
      .delete(workouts)
      .where(eq(workouts.id, id))
      .returning({ id: workouts.id })

    return deleted.length > 0
  },
}
