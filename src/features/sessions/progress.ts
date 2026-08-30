import type { SessionExercise, WorkoutSession } from './types'

/**
 * Where a session stands, derived rather than stored.
 *
 * Keeping a "current exercise" column would be a second source of truth that
 * can disagree with the counters; these read from the counters alone.
 */
export interface SessionProgress {
  /** The exercise being worked on, or `null` once everything is done. */
  currentExercise: SessionExercise | null
  /** Zero-based; equals `exercises.length` when finished. */
  currentIndex: number
  completedSets: number
  totalSets: number
  isComplete: boolean
}

export function getSessionProgress(session: WorkoutSession): SessionProgress {
  const currentIndex = session.exercises.findIndex(
    (exercise) => exercise.completedSets < exercise.targetSets,
  )

  const completedSets = session.exercises.reduce(
    (total, exercise) => total + exercise.completedSets,
    0,
  )

  const totalSets = session.exercises.reduce(
    (total, exercise) => total + exercise.targetSets,
    0,
  )

  const isComplete = currentIndex === -1

  return {
    currentExercise: isComplete ? null : session.exercises[currentIndex],
    currentIndex: isComplete ? session.exercises.length : currentIndex,
    completedSets,
    totalSets,
    isComplete,
  }
}
