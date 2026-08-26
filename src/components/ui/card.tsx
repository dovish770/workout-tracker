import { cn } from '@/lib/cn'

export type CardProps = React.ComponentProps<'div'>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn('border-line bg-surface rounded-lg border', className)}
    />
  )
}
