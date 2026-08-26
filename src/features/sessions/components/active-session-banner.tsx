import { Activity } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'
import { getActiveSession } from '../queries'

/**
 * The way back into a session that was left mid-workout.
 *
 * Leaving focus mode does not end a session, so without this the only way back
 * would be the browser's history.
 */
export async function ActiveSessionBanner() {
  const session = await getActiveSession()
  if (!session) return null

  return (
    <div className="border-accent/30 bg-accent/10 border-b">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-2 md:px-6">
        <p className="flex min-w-0 items-center gap-2 text-sm">
          <Activity className="text-accent size-4 shrink-0" aria-hidden />
          <span className="truncate">
            {dict.sessions.activeBanner(session.workoutName)}
          </span>
        </p>

        <ButtonLink size="sm" href={ROUTES.sessions.detail(session.id)}>
          {dict.sessions.resumeAction}
        </ButtonLink>
      </div>
    </div>
  )
}
