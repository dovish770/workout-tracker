import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ButtonLink } from '@/components/ui/button-link'
import { FocusScreen } from '@/components/ui/focus-screen'
import { SessionRunner } from '@/features/sessions/components/session-runner'
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

  // A finished session is still readable at its URL; it just has nothing to run.
  if (session.status !== 'active') {
    return (
      <FocusScreen
        title={dict.sessions.run.doneTitle}
        subtitle={dict.sessions.run.finished}
        tone="accent"
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
