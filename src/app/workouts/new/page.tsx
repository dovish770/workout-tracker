import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/button-link'
import { PageHeader } from '@/components/ui/page-header'
import { createWorkout } from '@/features/workouts/actions'
import { WorkoutForm } from '@/features/workouts/components/workout-form'
import { createEmptyWorkout } from '@/features/workouts/form-values'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'

export const metadata: Metadata = { title: dict.nav.newWorkout }

export default function NewWorkoutPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={dict.nav.newWorkout} />

      <WorkoutForm
        defaultValues={createEmptyWorkout()}
        submitLabel={dict.workouts.form.createSubmit}
        onSubmit={createWorkout}
        secondaryAction={
          <ButtonLink variant="ghost" href={ROUTES.workouts.list}>
            {dict.common.cancel}
          </ButtonLink>
        }
      />
    </div>
  )
}
