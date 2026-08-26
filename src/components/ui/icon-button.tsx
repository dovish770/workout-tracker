import { cn } from '@/lib/cn'

const VARIANT_CLASSES = {
  ghost: 'text-muted hover:bg-surface-hover hover:text-text active:bg-line',
  danger: 'text-muted hover:bg-danger/15 hover:text-danger active:bg-danger/25',
} as const

export type IconButtonVariant = keyof typeof VARIANT_CLASSES

export interface IconButtonProps extends Omit<
  React.ComponentProps<'button'>,
  'children'
> {
  /** Required: an icon-only control has no visible text to name it. */
  label: string
  icon: React.ReactNode
  variant?: IconButtonVariant
}

export function IconButton({
  label,
  icon,
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      {...props}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-40',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {icon}
    </button>
  )
}
