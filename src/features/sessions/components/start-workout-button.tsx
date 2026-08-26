'use client'

import { Play } from 'lucide-react'
import { useTransition } from 'react'
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { dict } from '@/i18n'
import { startSession } from '../actions'

export interface StartWorkoutButtonProps {
  workoutId: string
  size?: ButtonSize
  variant?: ButtonVariant
  className?: string
}

/**
 * Starts a session and hands over to focus mode.
 *
 * A button rather than a link: starting is a write, and it can legitimately
 * refuse — there is already a session running.
 */
export function StartWorkoutButton({
  workoutId,
  size,
  variant,
  className,
}: StartWorkoutButtonProps) {
  const [isStarting, startAction] = useTransition()
  const toast = useToast()

  function start() {
    startAction(async () => {
      // Redirects on success, so only a refusal comes back.
      const result = await startSession(workoutId)
      if (!result.ok) toast.show(result.error, 'danger')
    })
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={start}
      isLoading={isStarting}
      className={className}
    >
      <Play className="size-4 rtl:-scale-x-100" aria-hidden />
      {dict.sessions.startAction}
    </Button>
  )
}
