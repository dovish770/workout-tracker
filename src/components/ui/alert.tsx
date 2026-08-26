import { cn } from '@/lib/cn'

const VARIANT_CLASSES = {
  danger: 'border-danger/40 bg-danger/10 text-danger',
  info: 'border-line bg-surface text-muted',
} as const

export type AlertVariant = keyof typeof VARIANT_CLASSES

export interface AlertProps extends React.ComponentProps<'div'> {
  variant?: AlertVariant
}

/** `role="alert"` so a message appearing after submit is announced, not just shown. */
export function Alert({ variant = 'danger', className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      {...props}
      className={cn(
        'rounded-md border px-3 py-2 text-sm',
        VARIANT_CLASSES[variant],
        className,
      )}
    />
  )
}
