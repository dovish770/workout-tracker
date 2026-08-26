import { getWorkouts } from '@/features/workouts/queries'
import { getActiveSession } from '../queries'
import { SessionEntryPrompt } from './session-entry-prompt'

/**
 * Fetches what the prompt needs so the client component stays presentational.
 * Both queries are memoized per request, so this costs nothing extra on the
 * pages that already read them.
 */
export async function SessionEntryGate() {
  const [workouts, activeSession] = await Promise.all([getWorkouts(), getActiveSession()])

  return (
    <SessionEntryPrompt
      workouts={workouts}
      activeSession={
        activeSession
          ? { id: activeSession.id, workoutName: activeSession.workoutName }
          : null
      }
    />
  )
}
