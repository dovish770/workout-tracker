import type { SessionStatus } from './constants'

/**
 * One exercise inside a session — a copy taken when the session started, not a
 * view onto the workout's current exercise. See the note in `db/schema.ts`.
 */
export interface SessionExercise {
  id: string
  position: number
  name: string
  targetSets: number
  targetReps: number | null
  targetMaxWeight: number | null
  /** Rest between sets in seconds, or null when this exercise has no timer. */
  restSeconds: number | null
  completedSets: number
}

export interface WorkoutSession {
  id: string
  /** Null once the workout it came from has been deleted. */
  workoutId: string | null
  workoutName: string
  status: SessionStatus
  startedAt: Date
  completedAt: Date | null
  exercises: SessionExercise[]
}
