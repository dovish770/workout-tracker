import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WorkoutDetail } from '@/features/workouts/components/workout-detail'
import { getWorkoutById } from '@/features/workouts/queries'
import { dict } from '@/i18n'

/** Same reasoning as the list route: the database is the source of truth. */
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: PageProps<'/workouts/[id]'>): Promise<Metadata> {
  const { id } = await params
  // `getWorkoutById` is memoized per request, so this does not cost a second
  // query on top of the page's own.
  const workout = await getWorkoutById(id)

  return { title: workout?.name ?? dict.workouts.detail.notFoundTitle }
}

export default async function WorkoutPage({ params }: PageProps<'/workouts/[id]'>) {
  const { id } = await params
  const workout = await getWorkoutById(id)

  if (!workout) notFound()

  return <WorkoutDetail workout={workout} />
}
