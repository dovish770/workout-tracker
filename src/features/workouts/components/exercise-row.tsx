'use client'

import { GripVertical, Trash2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import type { DragHandleProps } from '@/components/ui/sortable-list'
import { dict } from '@/i18n'
import { cn } from '@/lib/cn'
import {
  REPS_MAX,
  REPS_MIN,
  SETS_MAX,
  SETS_MIN,
  WEIGHT_MAX,
  WEIGHT_MIN,
  WEIGHT_STEP,
} from '../constants'
import { toNullableNumber, type WorkoutFormValues } from '../form-values'

const text = dict.workouts.form

export interface ExerciseRowProps {
  index: number
  isDragging: boolean
  dragHandleProps: DragHandleProps
  canRemove: boolean
  onRemove: () => void
}

export function ExerciseRow({
  index,
  isDragging,
  dragHandleProps,
  canRemove,
  onRemove,
}: ExerciseRowProps) {
  // Read from context rather than props: prop-drilling `register` and `errors`
  // through the sortable list would couple it to this form.
  const {
    register,
    formState: { errors },
  } = useFormContext<WorkoutFormValues>()

  const rowErrors = errors.exercises?.[index]
  const numberField = { setValueAs: toNullableNumber }

  return (
    <Card
      className={cn(
        'flex flex-col gap-3 p-3 transition-colors duration-150 ease-out sm:flex-row sm:items-start',
        isDragging && 'border-accent',
      )}
    >
      <div className="flex items-center gap-2 sm:pt-6">
        <IconButton
          {...dragHandleProps}
          label={text.dragHandle}
          icon={<GripVertical className="size-4" />}
          className="cursor-grab active:cursor-grabbing"
        />
        <span className="text-muted text-xs tabular-nums sm:sr-only">
          {text.exercisePosition(index + 1)}
        </span>
      </div>

      <Field
        label={text.exerciseNameLabel}
        error={rowErrors?.name?.message}
        isRequired
        className="flex-1"
      >
        {(control) => (
          <Input
            {...control}
            {...register(`exercises.${index}.name`)}
            placeholder={text.exerciseNamePlaceholder}
            autoComplete="off"
          />
        )}
      </Field>

      <div className="grid grid-cols-3 gap-2 sm:w-72">
        <Field label={text.setsLabel} error={rowErrors?.sets?.message} isRequired>
          {(control) => (
            <Input
              {...control}
              {...register(`exercises.${index}.sets`, numberField)}
              type="number"
              inputMode="numeric"
              min={SETS_MIN}
              max={SETS_MAX}
            />
          )}
        </Field>

        <Field label={text.repsLabel} error={rowErrors?.reps?.message}>
          {(control) => (
            <Input
              {...control}
              {...register(`exercises.${index}.reps`, numberField)}
              type="number"
              inputMode="numeric"
              min={REPS_MIN}
              max={REPS_MAX}
            />
          )}
        </Field>

        <Field
          label={text.maxWeightLabel}
          hint={text.weightUnit}
          error={rowErrors?.maxWeight?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...register(`exercises.${index}.maxWeight`, numberField)}
              type="number"
              inputMode="decimal"
              min={WEIGHT_MIN}
              max={WEIGHT_MAX}
              step={WEIGHT_STEP}
            />
          )}
        </Field>
      </div>

      <div className="flex justify-end sm:pt-6">
        <IconButton
          label={text.removeExercise}
          variant="danger"
          icon={<Trash2 className="size-4" />}
          onClick={onRemove}
          disabled={!canRemove}
        />
      </div>
    </Card>
  )
}
