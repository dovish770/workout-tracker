import 'server-only'

import { z } from 'zod'
import { workoutRepository } from '@/db/repository'
import type { Workout } from './schema'

const idSchema = z.uuid()

export function getWorkouts(): Promise<Workout[]> {
  return workoutRepository.list()
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  // Postgres rejects a malformed uuid with an error; a bad URL segment is a
  // "not found", not a crash.
  if (!idSchema.safeParse(id).success) return null

  return workoutRepository.getById(id)
}
