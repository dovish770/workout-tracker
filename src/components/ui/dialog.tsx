'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  /** Blocks Escape and the backdrop while something irreversible is running. */
  isBusy?: boolean
  className?: string
}

/**
 * Modal built on the native `<dialog>`.
 *
 * Focus trapping, Escape, inertness of the page behind it and the backdrop all
 * come from the platform rather than from hand-written key handlers.
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  isBusy = false,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = 'dialog-title'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      // Escape fires `cancel`; route it through the caller so open/closed lives
      // in one place instead of the DOM closing itself behind React's back.
      onCancel={(event) => {
        event.preventDefault()
        if (!isBusy) onClose()
      }}
      aria-labelledby={titleId}
      className={cn(
        'border-line bg-surface text-text m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border p-6 backdrop:bg-black/70',
        className,
      )}
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {title}
      </h2>

      {description ? <p className="text-muted mt-2 text-sm">{description}</p> : null}

      {children ? <div className="mt-4">{children}</div> : null}

      {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
    </dialog>
  )
}
