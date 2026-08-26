'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { Alert } from './alert'
import { Button, type ButtonVariant } from './button'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  isConfirming?: boolean
  /** Shown inside the dialog when the action fails, so it stays open to retry. */
  error?: string
  confirmVariant?: ButtonVariant
  className?: string
}

/**
 * Built on the native `<dialog>`: focus trapping, Escape, inertness of the
 * page behind it and the backdrop all come from the platform rather than from
 * hand-written key handlers.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isConfirming = false,
  error,
  confirmVariant = 'danger',
  className,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      // Escape fires `cancel`; route it through the caller so state stays in
      // one place instead of the DOM closing itself behind React's back.
      onCancel={(event) => {
        event.preventDefault()
        if (!isConfirming) onCancel()
      }}
      aria-labelledby="confirm-dialog-title"
      className={cn(
        'border-line bg-surface text-text m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border p-6 backdrop:bg-black/70',
        className,
      )}
    >
      <h2 id="confirm-dialog-title" className="text-lg font-semibold">
        {title}
      </h2>

      {description ? <p className="text-muted mt-2 text-sm">{description}</p> : null}

      {error ? <Alert className="mt-4">{error}</Alert> : null}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isConfirming}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} isLoading={isConfirming}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
