'use client'

import { LogOut, RotateCcw, Timer, TimerOff, Undo2 } from 'lucide-react'
import { useOptimistic, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { FocusScreen } from '@/components/ui/focus-screen'
import { IconButton } from '@/components/ui/icon-button'
import { useToast } from '@/components/ui/toast'
import { useRestTimer } from '@/hooks/use-rest-timer'
import { useStoredFlag } from '@/hooks/use-stored-flag'
import { dict } from '@/i18n'
import { formatDuration } from '@/lib/format'
import { ROUTES } from '@/lib/routes'
import { completeSet, finishSession, undoSet } from '../actions'
import { getSessionProgress } from '../progress'
import type { WorkoutSession } from '../types'
import { MaxWeightHeader } from './max-weight-header'

const text = dict.sessions.run

const TIMER_ENABLED_KEY = 'session.timer.enabled'
const TIMER_VISIBLE_KEY = 'session.timer.visible'

/**
 * A stored rest older than this is left over from a session put down and
 * picked up much later. Resuming into a rest screen showing "+47:12" would be
 * noise, so past this point the rest is simply over.
 */
const STALE_REST_SECONDS = 10 * 60

type Stage = 'intro' | 'set' | 'rest' | 'transition' | 'done'

/**
 * The stages the session data cannot tell us about on its own: whether the
 * opening prompt has been acknowledged, and where a rest is heading when it
 * ends. "Done" comes from the counters and "rest" from the running timer.
 */
type LocalStage = Extract<Stage, 'intro' | 'set' | 'transition'>

export interface SessionRunnerProps {
  session: WorkoutSession
}

export function SessionRunner({ session }: SessionRunnerProps) {
  const [optimisticSession, addCompletedSet] = useOptimistic(
    session,
    (current, sessionExerciseId: string): WorkoutSession => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === sessionExerciseId
          ? {
              ...exercise,
              completedSets: Math.min(exercise.completedSets + 1, exercise.targetSets),
            }
          : exercise,
      ),
    }),
  )

  const progress = getSessionProgress(optimisticSession)

  // Where the run goes once nothing else takes precedence. A reload mid-workout
  // should not replay the opening prompt.
  const [localStage, setLocalStage] = useState<LocalStage>(() =>
    progress.completedSets === 0 ? 'intro' : 'set',
  )

  const [isPending, startAction] = useTransition()
  const [isTimerEnabled, setTimerEnabled] = useStoredFlag(TIMER_ENABLED_KEY, true)
  const [isTimerVisible, setTimerVisible] = useStoredFlag(TIMER_VISIBLE_KEY, true)
  const toast = useToast()

  const exercise = progress.currentExercise
  const restSeconds = exercise?.restSeconds ?? null

  // Keyed per exercise so a stored countdown belongs to the rest it started in.
  const timer = useRestTimer(
    restSeconds,
    `session.rest.${session.id}.${exercise?.id ?? ''}`,
  )

  const isResting = timer.isRunning && timer.overdueSeconds < STALE_REST_SECONDS

  /*
   * Stage is derived, not stored, so a reload lands where the workout actually
   * is. In particular the rest screen comes back from the persisted timer
   * rather than from state that a refresh throws away — otherwise reloading
   * mid-rest would skip straight to the next set.
   */
  const stage: Stage = progress.isComplete ? 'done' : isResting ? 'rest' : localStage

  function handleCompleteSet() {
    if (!exercise) return

    // Decided before the round trip: the counters here are enough to know what
    // comes next, and waiting for the server to answer would stall the tap.
    const finishesExercise = exercise.completedSets + 1 >= exercise.targetSets
    const isLastExercise =
      progress.currentIndex === optimisticSession.exercises.length - 1

    startAction(async () => {
      addCompletedSet(exercise.id)

      // Set where the run continues once any rest is over; the timer itself is
      // what puts the rest screen in front of it.
      setLocalStage(finishesExercise ? 'transition' : 'set')

      if (
        !(finishesExercise && isLastExercise) &&
        restSeconds !== null &&
        isTimerEnabled
      ) {
        timer.start()
      }

      const result = await completeSet(session.id, exercise.id)
      if (!result.ok) toast.show(result.error, 'danger')
    })
  }

  function handleUndo() {
    const target = exercise ?? optimisticSession.exercises.at(-1)
    if (!target) return

    startAction(async () => {
      timer.stop()
      const result = await undoSet(session.id, target.id)
      if (!result.ok) {
        toast.show(result.error, 'danger')
        return
      }

      setLocalStage('set')
    })
  }

  function handleFinish() {
    startAction(async () => {
      const result = await finishSession(session.id)
      if (!result.ok) toast.show(result.error, 'danger')
    })
  }

  const exitControl = (
    <ButtonLink variant="ghost" size="sm" href={ROUTES.workouts.list}>
      <LogOut className="size-4 rtl:-scale-x-100" aria-hidden />
      {text.exit}
    </ButtonLink>
  )

  const undoControl =
    progress.completedSets > 0 ? (
      <Button variant="ghost" size="sm" onClick={handleUndo} disabled={isPending}>
        <Undo2 className="size-4" aria-hidden />
        {text.undoSet}
      </Button>
    ) : null

  if (stage === 'intro' && exercise) {
    return (
      <FocusScreen
        eyebrow={text.firstExercise}
        title={exercise.name}
        subtitle={text.setsCount(exercise.targetSets)}
        action={
          <Button size="lg" onClick={() => setLocalStage('set')}>
            {text.startAction}
          </Button>
        }
        secondary={exitControl}
      />
    )
  }

  if (stage === 'transition' && exercise) {
    return (
      <FocusScreen
        eyebrow={text.nextExercise}
        title={exercise.name}
        subtitle={text.setsCount(exercise.targetSets)}
        action={
          <Button size="lg" onClick={() => setLocalStage('set')}>
            {text.readyAction}
          </Button>
        }
        secondary={
          <>
            {undoControl}
            {exitControl}
          </>
        }
      />
    )
  }

  if (stage === 'rest') {
    const isOverdue = timer.isOverdue

    return (
      <FocusScreen
        eyebrow={text.restTitle}
        tone={isOverdue ? 'danger' : 'accent'}
        title={
          isTimerVisible
            ? isOverdue
              ? `+${formatDuration(timer.overdueSeconds)}`
              : formatDuration(timer.remainingSeconds)
            : text.restTitle
        }
        subtitle={
          isOverdue && isTimerVisible ? text.overdueBy(timer.overdueSeconds) : undefined
        }
        action={
          <Button size="lg" onClick={timer.stop}>
            {text.restContinue}
          </Button>
        }
        secondary={
          <>
            <Button variant="ghost" size="sm" onClick={timer.restart}>
              <RotateCcw className="size-4" aria-hidden />
              {text.restReset}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimerVisible(!isTimerVisible)}
            >
              {isTimerVisible ? text.timerHide : text.timerShow}
            </Button>
            {exitControl}
          </>
        }
      />
    )
  }

  if (stage === 'done' || !exercise) {
    return (
      <FocusScreen
        title={text.doneTitle}
        subtitle={text.doneSubtitle}
        tone="accent"
        action={
          <Button size="lg" onClick={handleFinish} isLoading={isPending}>
            {text.finish}
          </Button>
        }
        secondary={
          <>
            {undoControl}
            {exitControl}
          </>
        }
      />
    )
  }

  return (
    <FocusScreen
      header={
        <MaxWeightHeader
          sessionId={session.id}
          sessionExerciseId={exercise.id}
          maxWeight={exercise.targetMaxWeight}
        />
      }
      eyebrow={exercise.name}
      title={text.setTitle(exercise.completedSets + 1)}
      subtitle={
        exercise.targetReps === null
          ? text.noTarget
          : text.targetReps(exercise.targetReps)
      }
      action={
        <Button size="lg" onClick={handleCompleteSet} disabled={isPending}>
          {text.completeSet}
        </Button>
      }
      secondary={
        <>
          {undoControl}
          <IconButton
            label={isTimerEnabled ? text.timerDisable : text.timerEnable}
            icon={
              isTimerEnabled ? (
                <Timer className="size-4" />
              ) : (
                <TimerOff className="size-4" />
              )
            }
            onClick={() => setTimerEnabled(!isTimerEnabled)}
            className={isTimerEnabled ? 'text-accent' : undefined}
          />
          {exitControl}
        </>
      }
      footer={
        <p className="text-muted text-xs tabular-nums">
          {text.exerciseProgress(
            progress.currentIndex + 1,
            optimisticSession.exercises.length,
          )}
          {' · '}
          {text.setProgress(exercise.completedSets, exercise.targetSets)}
          {' · '}
          {text.totalProgress(progress.completedSets, progress.totalSets)}
        </p>
      }
    />
  )
}
