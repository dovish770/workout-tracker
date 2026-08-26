import { cn } from '@/lib/cn'

const VARIANT_CLASSES = {
  neutral: 'border-line bg-surface text-muted',
  accent: 'border-accent/30 bg-accent/10 text-accent',
} as const

export type BadgeVariant = keyof typeof VARIANT_CLASSES

export interface BadgeProps extends React.ComponentProps<'span'> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums',
        VARIANT_CLASSES[variant],
        className,
      )}
    />
  )
}
