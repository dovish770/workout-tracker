import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const BASE_CLASSES =
  'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md font-medium transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-50'

const VARIANT_CLASSES = {
  primary: 'bg-accent text-accent-contrast hover:bg-accent-hover active:bg-accent-active',
  ghost:
    'border border-line text-text hover:border-line-strong hover:bg-surface-hover active:bg-line',
  danger:
    'border border-danger/40 text-danger hover:border-danger hover:bg-danger/15 active:bg-danger/25',
} as const

const SIZE_CLASSES = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
} as const

export type ButtonVariant = keyof typeof VARIANT_CLASSES
export type ButtonSize = keyof typeof SIZE_CLASSES

export interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

/**
 * Shared so a link that looks like a button (`ButtonLink`) cannot drift from
 * the real thing. Semantics decide the element; this decides the appearance.
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: ButtonStyleProps) {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)
}

export interface ButtonProps extends React.ComponentProps<'button'>, ButtonStyleProps {
  /** Shows a spinner and blocks further clicks. Caller supplies the pending copy. */
  isLoading?: boolean
}

export function Button({
  variant,
  size,
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClasses({ variant, size, className })}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  )
}
