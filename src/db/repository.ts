import 'server-only'

import { desc, eq } from 'drizzle-orm'
import type { Workout, WorkoutInput } from '@/features/workouts/schema'
import { db } from './client'
import { workouts } from './schema'

/**
 * The data-access boundary.
 *
 * Everything above this line — queries, actions, UI — depends on this
 * interface and never on Drizzle, so swapping the store or reshaping a query
 * stays contained to this file.
 */
export interface WorkoutRepository {
  list(): Promise<Workout[]>
  getById(id: string): Promise<Workout | null>
  create(input: WorkoutInput): Promise<Workout>
  update(id: string, input: WorkoutInput): Promise<Workout | null>
  remove(id: string): Promise<boolean>
}

export const workoutRepository: WorkoutRepository = {
  list() {
    return db.select().from(workouts).orderBy(desc(workouts.createdAt))
  },

  async getById(id) {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id)).limit(1)
    return workout ?? null
  },

  async create(input) {
    const [workout] = await db.insert(workouts).values(input).returning()
    return workout
  },

  async update(id, input) {
    const [workout] = await db
      .update(workouts)
      // `updated_at` only defaults on insert; an update has to set it.
      .set({ ...input, updatedAt: new Date() })
      .where(eq(workouts.id, id))
      .returning()

    return workout ?? null
  },

  async remove(id) {
    const deleted = await db
      .delete(workouts)
      .where(eq(workouts.id, id))
      .returning({ id: workouts.id })

    return deleted.length > 0
  },
}
