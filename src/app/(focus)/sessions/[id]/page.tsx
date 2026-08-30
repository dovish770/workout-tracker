import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ButtonLink } from '@/components/ui/button-link'
import { FocusScreen } from '@/components/ui/focus-screen'
import { SessionRunner } from '@/features/sessions/components/session-runner'
import { SESSION_MAX_HOURS } from '@/features/sessions/constants'
import { getSessionById } from '@/features/sessions/queries'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'

/** Always the live counters — a cached page would show a stale set number. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: PageProps<'/sessions/[id]'>): Promise<Metadata> {
  const { id } = await params
  const session = await getSessionById(id)

  return { title: session?.workoutName ?? dict.sessions.errors.notFoundTitle }
}

export default async function SessionPage({ params }: PageProps<'/sessions/[id]'>) {
  const { id } = await params
  const session = await getSessionById(id)

  if (!session) notFound()

  // A session that is over is still readable at its URL; it just has nothing
  // to run. Timing out reads differently from finishing, and says so.
  if (session.status !== 'active') {
    const isExpired = session.status === 'expired'

    return (
      <FocusScreen
        title={
          isExpired ? dict.sessions.errors.expiredTitle : dict.sessions.run.doneTitle
        }
        subtitle={
          isExpired
            ? dict.sessions.errors.expiredDescription(SESSION_MAX_HOURS)
            : dict.sessions.run.finished
        }
        tone={isExpired ? 'default' : 'accent'}
        action={
          <ButtonLink size="lg" href={ROUTES.workouts.list}>
            {dict.sessions.run.backToWorkouts}
          </ButtonLink>
        }
      />
    )
  }

  return <SessionRunner session={session} />
}
