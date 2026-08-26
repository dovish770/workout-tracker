'use client'

import { ChevronLeft, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Dialog } from '@/components/ui/dialog'
import { useStoredFlag } from '@/hooks/use-stored-flag'
import type { WorkoutSummary } from '@/features/workouts/schema'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'
import { useStartWorkout } from '../use-start-workout'

const text = dict.sessions.startDialog

/** Session storage, not local: "once per visit", not "once ever". */
const SEEN_KEY = 'session.prompt.seen'

export interface SessionEntryPromptProps {
  workouts: WorkoutSummary[]
  activeSession: { id: string; workoutName: string } | null
}

/**
 * Offers a workout on arrival, and offers to resume one already running.
 *
 * Shown once per browser visit rather than on every navigation: a dialog that
 * reappears on each page becomes something people dismiss without reading, and
 * then it is worth nothing on the day it matters.
 */
export function SessionEntryPrompt({ workouts, activeSession }: SessionEntryPromptProps) {
  const [isDismissed, setDismissed] = useStoredFlag(SEEN_KEY, false, 'session')
  const { start, isStarting } = useStartWorkout()

  // Nothing to offer, nothing to ask.
  const hasSomethingToOffer = activeSession !== null || workouts.length > 0

  function dismiss() {
    setDismissed(true)
  }

  if (activeSession) {
    return (
      <Dialog
        isOpen={!isDismissed}
        onClose={dismiss}
        title={text.resumeTitle}
        description={text.resumeDescription(activeSession.workoutName)}
        footer={
          <>
            <Button variant="ghost" onClick={dismiss}>
              {text.dismiss}
            </Button>
            <ButtonLink href={ROUTES.sessions.detail(activeSession.id)} onClick={dismiss}>
              {dict.sessions.resumeAction}
            </ButtonLink>
          </>
        }
      />
    )
  }

  return (
    <Dialog
      isOpen={!isDismissed && hasSomethingToOffer}
      onClose={dismiss}
      title={text.title}
      description={text.description}
      isBusy={isStarting}
      footer={
        <Button variant="ghost" onClick={dismiss} disabled={isStarting}>
          {text.dismiss}
        </Button>
      }
    >
      <ul aria-label={text.pickWorkout} className="flex flex-col gap-2">
        {workouts.map((workout) => (
          <li key={workout.id}>
            <button
              type="button"
              onClick={() => start(workout.id)}
              disabled={isStarting}
              className="border-line hover:border-line-strong hover:bg-surface-hover flex w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-start transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-50"
            >
              <Play
                className="text-accent size-4 shrink-0 rtl:-scale-x-100"
                aria-hidden
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{workout.name}</span>
                <span className="text-muted block text-xs">
                  {text.exercisesCount(workout.exerciseCount)}
                </span>
              </span>

              <ChevronLeft
                className="text-muted size-4 shrink-0 rtl:-scale-x-100"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  )
}
