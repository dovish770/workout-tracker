'use client'

import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { PageHeader } from '@/components/ui/page-header'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'
import { updateWorkout } from '../actions'
import { toFormValues } from '../form-values'
import type { Workout, WorkoutInput } from '../schema'
import { DeleteWorkoutButton } from './delete-workout-button'
import { WorkoutForm } from './workout-form'
import { WorkoutReadView } from './workout-read-view'

export interface WorkoutDetailProps {
  workout: Workout
}

/**
 * Reading and editing are the same page, toggled in place.
 *
 * Editing reuses `WorkoutForm` untouched — the create screen and this one
 * differ only in their defaults, their label and their action.
 */
export function WorkoutDetail({ workout }: WorkoutDetailProps) {
  const [isEditing, setIsEditing] = useState(false)

  async function submitEdit(values: WorkoutInput) {
    const result = await updateWorkout(workout.id, values)
    if (result.ok) setIsEditing(false)

    return result
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={workout.name}
        description={workout.description || undefined}
        actions={
          isEditing ? null : (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(true)}>
                <Pencil className="size-4" aria-hidden />
                {dict.common.edit}
              </Button>
              <DeleteWorkoutButton workoutId={workout.id} />
            </>
          )
        }
      />

      {isEditing ? (
        <WorkoutForm
          // Remounts once the server sends back a saved workout, so the form
          // restarts from the persisted values rather than from stale defaults.
          key={workout.updatedAt.toISOString()}
          defaultValues={toFormValues(workout)}
          submitLabel={dict.workouts.form.updateSubmit}
          onSubmit={submitEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <WorkoutReadView workout={workout} />

          <div>
            <ButtonLink variant="ghost" size="sm" href={ROUTES.workouts.list}>
              {dict.workouts.detail.backToList}
            </ButtonLink>
          </div>
        </>
      )}
    </div>
  )
}
