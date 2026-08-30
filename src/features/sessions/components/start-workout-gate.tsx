import { getActiveSession } from '../queries'
import { StartWorkoutProvider } from './start-workout-provider'

/**
 * Supplies the running workout's name so the conflict dialog can say which
 * workout is about to be stopped. Memoized per request, so it costs nothing
 * on top of the banner that already reads it.
 */
export async function StartWorkoutGate({ children }: { children: React.ReactNode }) {
  const activeSession = await getActiveSession()

  return (
    <StartWorkoutProvider activeWorkoutName={activeSession?.workoutName ?? null}>
      {children}
    </StartWorkoutProvider>
  )
}
