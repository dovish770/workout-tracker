import { cn } from '@/lib/cn'

export type SkeletonProps = React.ComponentProps<'div'>

/** A placeholder block. Decorative by definition, so it is hidden from AT. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      {...props}
      className={cn('bg-surface animate-pulse rounded-md', className)}
    />
  )
}
