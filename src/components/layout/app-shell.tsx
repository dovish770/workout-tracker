import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { ToastProvider } from '@/components/ui/toast'
import { ROUTES } from '@/lib/routes'
import { dict } from '@/i18n'
import { MainNav } from './main-nav'

const MAIN_CONTENT_ID = 'main-content'

export interface AppShellProps {
  children: React.ReactNode
}

/** Header, page container and vertical rhythm — every route sits inside this. */
export function AppShell({ children }: AppShellProps) {
  return (
    <ToastProvider regionLabel={dict.a11y.notifications} dismissLabel={dict.a11y.dismiss}>
      <div className="flex min-h-full flex-col">
        {/*
          Visible only once focused, so keyboard users can jump the header
          instead of tabbing through it on every page.
        */}
        <a
          href={`#${MAIN_CONTENT_ID}`}
          className="focus-visible:bg-accent focus-visible:text-accent-contrast sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium"
        >
          {dict.a11y.skipToContent}
        </a>

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

        <main
          id={MAIN_CONTENT_ID}
          className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-6 md:py-10"
        >
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
