import { cn } from '@/lib/cn'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  /** The way out of the empty state — an empty state without one is a dead end. */
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-line flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center',
        className,
      )}
    >
      {icon ? <div className="text-muted">{icon}</div> : null}

      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="text-muted max-w-sm text-sm">{description}</p>
        ) : null}
      </div>

      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
