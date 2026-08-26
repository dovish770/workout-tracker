'use client'

import { Check, TriangleAlert, X } from 'lucide-react'
import { createContext, use, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

const TOAST_DURATION_MS = 4000

const VARIANT_CLASSES = {
  success: 'border-accent/30 text-text',
  danger: 'border-danger/40 text-text',
} as const

const VARIANT_ICONS = {
  success: <Check className="text-accent size-4" aria-hidden />,
  danger: <TriangleAlert className="text-danger size-4" aria-hidden />,
} as const

export type ToastVariant = keyof typeof VARIANT_CLASSES

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Transient confirmation of something that already happened.
 *
 * Never used for anything the user must act on — that belongs inline, next to
 * the control, where it cannot time out before being read.
 */
export function useToast(): ToastContextValue {
  const context = use(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')

  return context
}

export interface ToastProviderProps {
  /** Accessible name for the live region, since it holds no heading. */
  regionLabel: string
  dismissLabel: string
  children: React.ReactNode
}

export function ToastProvider({
  regionLabel,
  dismissLabel,
  children,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback((message: string, variant: ToastVariant = 'success') => {
    nextId.current += 1
    setToasts((current) => [...current, { id: nextId.current, message, variant }])
  }, [])

  return (
    <ToastContext value={{ show }}>
      {children}

      <div
        // `polite` so it never interrupts; the region must exist before any
        // toast does, or screen readers will not announce the first one.
        role="status"
        aria-live="polite"
        aria-label={regionLabel}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            dismissLabel={dismissLabel}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext>
  )
}

interface ToastItemProps {
  toast: Toast
  dismissLabel: string
  onDismiss: (id: number) => void
}

function ToastItem({ toast, dismissLabel, onDismiss }: ToastItemProps) {
  const { id } = toast

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(id), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div
      className={cn(
        'bg-surface pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-md border px-3 py-2.5 text-sm',
        VARIANT_CLASSES[toast.variant],
      )}
    >
      {VARIANT_ICONS[toast.variant]}
      <p className="min-w-0 flex-1">{toast.message}</p>

      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label={dismissLabel}
        className="text-muted hover:bg-surface-hover hover:text-text shrink-0 cursor-pointer rounded-md p-1 transition-colors duration-150 ease-out"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
