import 'server-only'

import { cache } from 'react'
import { z } from 'zod'
import { workoutRepository } from '@/db/repository'
import type { Workout, WorkoutSummary } from './schema'

const idSchema = z.uuid()

/** Memoized per request — the entry prompt in the layout also needs this list. */
export const getWorkouts = cache(async (): Promise<WorkoutSummary[]> => {
  return workoutRepository.list()
})

/**
 * Memoized for the duration of one request: `generateMetadata` and the page
 * body both need the workout, and without this they would each query for it.
 */
export const getWorkoutById = cache(async (id: string): Promise<Workout | null> => {
  // Postgres rejects a malformed uuid with an error; a bad URL segment is a
  // "not found", not a crash.
  if (!idSchema.safeParse(id).success) return null

  return workoutRepository.getById(id)
})
