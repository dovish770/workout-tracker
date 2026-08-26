import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface DisclosureProps {
  summary: string
  children: React.ReactNode
  className?: string
}

/**
 * Built on `<details>`: it toggles without JavaScript, is keyboard operable and
 * is announced as expanded or collapsed, none of which a div and a `useState`
 * give for free.
 */
export function Disclosure({ summary, children, className }: DisclosureProps) {
  return (
    <details className={cn('group w-full', className)}>
      <summary className="text-muted hover:text-text flex cursor-pointer list-none items-center justify-center gap-1.5 text-xs transition-colors duration-150 ease-out">
        {summary}
        <ChevronDown
          aria-hidden
          className="size-3.5 transition-transform duration-150 ease-out group-open:rotate-180"
        />
      </summary>

      <div className="mt-3">{children}</div>
    </details>
  )
}
