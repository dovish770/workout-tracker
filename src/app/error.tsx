'use client'

import { TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/app-shell'
import { EmptyState } from '@/components/ui/empty-state'
import { dict } from '@/i18n'

export interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Catches anything that escapes a page's own handling.
 *
 * The error object itself is never rendered: in production it carries only a
 * digest, and in development it can contain query fragments and stack traces.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('unhandled error', error)
  }, [error])

  return (
    <AppShell>
      <EmptyState
        icon={<TriangleAlert className="size-6" />}
        title={dict.errors.title}
        description={dict.errors.description}
        action={
          <Button size="sm" onClick={reset}>
            {dict.errors.retry}
          </Button>
        }
      />
    </AppShell>
  )
}
