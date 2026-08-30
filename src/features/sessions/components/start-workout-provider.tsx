'use client'

import { createContext, use, useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { dict } from '@/i18n'
import { replaceActiveSession, startSession } from '../actions'
import { SESSION_ERROR_CODE } from '../constants'

const text = dict.sessions.conflict

export interface StartWorkoutContextValue {
  start: (workoutId: string) => void
  /** The workout currently being started, so only its own control shows pending. */
  startingWorkoutId: string | null
}

const StartWorkoutContext = createContext<StartWorkoutContextValue | null>(null)

export function useStartWorkoutContext(): StartWorkoutContextValue {
  const context = use(StartWorkoutContext)
  if (!context)
    throw new Error('useStartWorkout must be used inside <StartWorkoutProvider>')

  return context
}

export interface StartWorkoutProviderProps {
  /** Name of the running workout, for the conflict dialog. */
  activeWorkoutName: string | null
  children: React.ReactNode
}

/**
 * Owns starting a workout for the whole app.
 *
 * Starting is offered from the list, the workout page and the entry prompt, and
 * all three hit the same wall: a session is already running. Handling that in
 * one place means one conflict dialog in the document and one definition of
 * what "stop it and start this instead" does — rather than three that drift.
 */
export function StartWorkoutProvider({
  activeWorkoutName,
  children,
}: StartWorkoutProviderProps) {
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(null)
  const [conflictWorkoutId, setConflictWorkoutId] = useState<string | null>(null)
  const [isReplacing, startReplacing] = useTransition()
  const [, startAction] = useTransition()
  const toast = useToast()

  function start(workoutId: string) {
    setStartingWorkoutId(workoutId)

    startAction(async () => {
      // Redirects into focus mode on success, so only a refusal comes back.
      const result = await startSession(workoutId)
      setStartingWorkoutId(null)

      if (result.ok) return

      if (result.code === SESSION_ERROR_CODE.activeSessionExists) {
        setConflictWorkoutId(workoutId)
        return
      }

      toast.show(result.error, 'danger')
    })
  }

  function replace() {
    if (!conflictWorkoutId) return

    startReplacing(async () => {
      const result = await replaceActiveSession(conflictWorkoutId)
      if (result.ok) return

      setConflictWorkoutId(null)
      toast.show(result.error, 'danger')
    })
  }

  return (
    <StartWorkoutContext value={{ start, startingWorkoutId }}>
      {children}

      <ConfirmDialog
        isOpen={conflictWorkoutId !== null}
        title={text.title}
        description={
          activeWorkoutName
            ? text.description(activeWorkoutName)
            : text.descriptionUnknown
        }
        confirmLabel={text.confirm}
        cancelLabel={dict.common.cancel}
        onConfirm={replace}
        onCancel={() => setConflictWorkoutId(null)}
        isConfirming={isReplacing}
      />
    </StartWorkoutContext>
  )
}
