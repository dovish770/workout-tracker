'use client'

import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { SortableList } from '@/components/ui/sortable-list'
import { dict } from '@/i18n'
import { EXERCISES_MIN } from '../constants'
import { createEmptyExercise, type WorkoutFormValues } from '../form-values'
import { ExerciseRow } from './exercise-row'

const text = dict.workouts.form

export function ExerciseFields() {
  const {
    control,
    setFocus,
    formState: { errors },
  } = useFormContext<WorkoutFormValues>()

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'exercises',
    // Default is `id`, which would shadow the exercise's own id field.
    keyName: 'key',
  })

  function addExercise() {
    append(createEmptyExercise())
    // The row lands empty; put the caret in it instead of making the user aim.
    setFocus(`exercises.${fields.length}.name`)
  }

  // An error on the array itself (too few rows) rather than on a row's field.
  const listError = errors.exercises?.root?.message ?? errors.exercises?.message

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{text.exercisesTitle}</h2>

      {listError ? <Alert>{listError}</Alert> : null}

      <SortableList
        items={fields}
        getItemId={(field) => field.key}
        onReorder={move}
        messages={dict.workouts.reorder}
        renderItem={(field, index, { isDragging, dragHandleProps }) => (
          <ExerciseRow
            index={index}
            isDragging={isDragging}
            dragHandleProps={dragHandleProps}
            canRemove={fields.length > EXERCISES_MIN}
            onRemove={() => remove(index)}
          />
        )}
      />

      <div>
        <Button variant="ghost" size="sm" onClick={addExercise}>
          <Plus className="size-4" aria-hidden />
          {text.addExercise}
        </Button>
      </div>
    </section>
  )
}
