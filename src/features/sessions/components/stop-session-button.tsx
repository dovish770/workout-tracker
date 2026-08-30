'use client'

import { Square } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { dict } from '@/i18n'
import { abandonSession } from '../actions'

const text = dict.sessions.abandon

export interface StopSessionButtonProps {
  sessionId: string
  size?: ButtonSize
  variant?: ButtonVariant
}

/**
 * Ends a workout early, from wherever the user happens to be.
 *
 * Distinct from finishing: the progress is kept, but the run is over and
 * cannot be resumed — which is why it asks first.
 */
export function StopSessionButton({
  sessionId,
  size = 'sm',
  variant = 'ghost',
}: StopSessionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStopping, startStopping] = useTransition()

  function stop() {
    setError(null)

    startStopping(async () => {
      // Redirects to the workout list on success, so nothing below runs.
      const result = await abandonSession(sessionId)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <>
      <Button size={size} variant={variant} onClick={() => setIsOpen(true)}>
        <Square className="size-4" aria-hidden />
        {text.action}
      </Button>

      <ConfirmDialog
        isOpen={isOpen}
        title={text.title}
        description={text.description}
        confirmLabel={text.confirm}
        cancelLabel={dict.common.cancel}
        onConfirm={stop}
        onCancel={() => {
          setIsOpen(false)
          setError(null)
        }}
        isConfirming={isStopping}
        error={error ?? undefined}
      />
    </>
  )
}
