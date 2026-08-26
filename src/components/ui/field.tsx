'use client'

import { useId } from 'react'
import { cn } from '@/lib/cn'

/** Wiring handed to the control so ids and ARIA never have to be written by hand. */
export interface FieldControlProps {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

export interface FieldProps {
  label: string
  error?: string
  hint?: string
  isRequired?: boolean
  /** Keeps the label for screen readers only — for dense rows with repeated columns. */
  isLabelHidden?: boolean
  className?: string
  children: (control: FieldControlProps) => React.ReactNode
}

/**
 * Label + control + message, with the id/ARIA plumbing done once.
 *
 * Uses a render prop rather than cloning children so the control stays an
 * ordinary element the caller fully owns (register(), refs, extra props).
 */
export function Field({
  label,
  error,
  hint,
  isRequired,
  isLabelHidden,
  className,
  children,
}: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const hasError = Boolean(error)
  const isHintVisible = Boolean(hint) && !hasError
  const describedBy =
    [hasError ? errorId : null, isHintVisible ? hintId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn('text-muted text-xs font-medium', isLabelHidden && 'sr-only')}
      >
        {label}
        {isRequired ? (
          <span aria-hidden className="text-accent ms-0.5">
            *
          </span>
        ) : null}
      </label>

      {children({
        id,
        'aria-invalid': hasError || undefined,
        'aria-describedby': describedBy,
      })}

      {isHintVisible ? (
        <p id={hintId} className="text-muted text-xs">
          {hint}
        </p>
      ) : null}

      {hasError ? (
        <p id={errorId} className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}
