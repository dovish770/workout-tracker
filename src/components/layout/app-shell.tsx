import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { dict } from '@/i18n'
import { MainNav } from './main-nav'

export interface AppShellProps {
  children: React.ReactNode
}

/** Header, page container and vertical rhythm — every route sits inside this. */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-line border-b">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-4 px-4 md:px-6">
          <Link
            href={ROUTES.workouts.list}
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <Dumbbell className="text-accent size-4" aria-hidden />
            {dict.nav.brand}
          </Link>

          <MainNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  )
}
