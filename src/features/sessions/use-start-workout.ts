'use client'

import { useTransition } from 'react'
import { useToast } from '@/components/ui/toast'
import { startSession } from './actions'

export interface StartWorkout {
  start: (workoutId: string) => void
  isStarting: boolean
}

/**
 * Starting a workout from anywhere: the list, the workout page, the entry
 * prompt. Shared so the pending state and the "already active" refusal are
 * handled identically wherever the action is offered.
 */
export function useStartWorkout(): StartWorkout {
  const [isStarting, startAction] = useTransition()
  const toast = useToast()

  function start(workoutId: string) {
    startAction(async () => {
      // Redirects into focus mode on success, so only a refusal comes back.
      const result = await startSession(workoutId)
      if (!result.ok) toast.show(result.error, 'danger')
    })
  }

  return { start, isStarting }
}
