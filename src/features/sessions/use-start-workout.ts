'use client'

import { useStartWorkoutContext } from './components/start-workout-provider'

export interface StartWorkout {
  start: (workoutId: string) => void
  isStarting: (workoutId: string) => boolean
}

/**
 * Starting a workout from anywhere: the list, the workout page, the entry
 * prompt. The work itself lives in the provider so the pending state and the
 * "already running" conflict are handled once.
 */
export function useStartWorkout(): StartWorkout {
  const { start, startingWorkoutId } = useStartWorkoutContext()

  return { start, isStarting: (workoutId) => startingWorkoutId === workoutId }
}
