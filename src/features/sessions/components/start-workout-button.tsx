'use client'

import { Play } from 'lucide-react'
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/button'
import { dict } from '@/i18n'
import { useStartWorkout } from '../use-start-workout'

export interface StartWorkoutButtonProps {
  workoutId: string
  size?: ButtonSize
  variant?: ButtonVariant
  className?: string
}

/**
 * A button rather than a link: starting is a write, and it can legitimately
 * refuse when a session is already running.
 */
export function StartWorkoutButton({
  workoutId,
  size,
  variant,
  className,
}: StartWorkoutButtonProps) {
  const { start, isStarting } = useStartWorkout()

  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => start(workoutId)}
      isLoading={isStarting(workoutId)}
      className={className}
    >
      <Play className="size-4 rtl:-scale-x-100" aria-hidden />
      {dict.sessions.startAction}
    </Button>
  )
}
