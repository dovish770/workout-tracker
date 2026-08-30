'use client'

import { Alert } from './alert'
import { Button, type ButtonVariant } from './button'
import { Dialog } from './dialog'

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

/** The two-button case of `Dialog`: confirm something, or back out. */
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
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      isBusy={isConfirming}
      className={className}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} isLoading={isConfirming}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {error ? <Alert>{error}</Alert> : null}
    </Dialog>
  )
}
