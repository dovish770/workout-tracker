import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { PageHeader } from '@/components/ui/page-header'
import { WorkoutsTable } from '@/features/workouts/components/workouts-table'
import { getWorkouts } from '@/features/workouts/queries'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'

const text = dict.workouts.list

export const metadata: Metadata = { title: text.title }

/**
 * The database is also written to from outside the app (seeds, the Neon
 * console), so a prerendered snapshot would go stale without anything here
 * marking it dirty. Reading per request costs one round trip and is always
 * right.
 */
export const dynamic = 'force-dynamic'

export default async function WorkoutsPage() {
  const workouts = await getWorkouts()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          <ButtonLink href={ROUTES.workouts.new}>
            <Plus className="size-4" aria-hidden />
            {text.newAction}
          </ButtonLink>
        }
      />

      <WorkoutsTable workouts={workouts} />
    </div>
  )
}
