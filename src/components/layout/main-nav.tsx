'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { ROUTES } from '@/lib/routes'
import { dict } from '@/i18n'

const NAV_ITEMS = [
  { href: ROUTES.workouts.list, label: dict.nav.workouts },
  { href: ROUTES.workouts.new, label: dict.nav.newWorkout },
] as const

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav aria-label={dict.nav.brand}>
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          // Exact match only: /workouts must not light up on /workouts/new.
          const isActive = pathname === item.href

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex h-8 items-center rounded-md px-3 text-sm transition-colors duration-150 ease-out',
                  isActive
                    ? 'bg-surface-hover text-text'
                    : 'text-muted hover:bg-surface hover:text-text',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
