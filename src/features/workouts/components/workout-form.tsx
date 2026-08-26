'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm, type Path } from 'react-hook-form'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import { dict } from '@/i18n'
import type { ActionResult } from '@/lib/result'
import { WORKOUT_DESCRIPTION_MAX, WORKOUT_NAME_MAX } from '../constants'
import type { WorkoutFormValues } from '../form-values'
import { workoutInputSchema, type WorkoutInput } from '../schema'
import { ExerciseFields } from './exercise-fields'

const text = dict.workouts.form

export interface WorkoutFormProps {
  defaultValues: WorkoutFormValues
  submitLabel: string
  /** A server action. On success it either redirects or resolves with `ok`. */
  onSubmit: (values: WorkoutInput) => Promise<ActionResult<unknown>>
  /** A navigation control beside submit — the document-level guard covers it. */
  secondaryAction?: React.ReactNode
  /** An in-page cancel that does not navigate; routed through the same prompt. */
  onCancel?: () => void
}

/**
 * The only workout form. Creating and editing differ solely in their default
 * values, submit label and action, so they share this component rather than
 * duplicating a screen's worth of fields.
 */
export function WorkoutForm({
  defaultValues,
  submitLabel,
  onSubmit,
  secondaryAction,
  onCancel,
}: WorkoutFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<WorkoutFormValues, unknown, WorkoutInput>({
    resolver: zodResolver(workoutInputSchema),
    defaultValues,
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = form

  // A submit in flight is on its way out of the page on purpose; only an
  // abandoned edit should be held back.
  const leaveGuard = useUnsavedChangesGuard(isDirty && !isSubmitting)

  async function submit(values: WorkoutInput) {
    setFormError(null)

    // A successful create redirects, so this promise may never settle — the
    // component unmounts mid-navigation. Only failures get past here.
    const result = await onSubmit(values)
    if (result.ok) return

    if (result.fieldErrors) {
      for (const [path, messages] of Object.entries(result.fieldErrors)) {
        setError(path as Path<WorkoutFormValues>, { message: messages[0] })
      }
      return
    }

    setFormError(result.error)
  }

  return (
    <FormProvider {...form}>
      <ConfirmDialog
        isOpen={leaveGuard.isPrompting}
        title={dict.unsavedChanges.title}
        description={dict.unsavedChanges.description}
        confirmLabel={dict.unsavedChanges.confirm}
        cancelLabel={dict.unsavedChanges.cancel}
        onConfirm={leaveGuard.confirmLeave}
        onCancel={leaveGuard.cancelLeave}
      />

      <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-8">
        {formError ? <Alert>{formError}</Alert> : null}

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">{text.detailsTitle}</h2>

          <Card className="flex flex-col gap-4 p-4">
            <Field label={text.nameLabel} error={errors.name?.message} isRequired>
              {(control) => (
                <Input
                  {...control}
                  {...register('name')}
                  placeholder={text.namePlaceholder}
                  maxLength={WORKOUT_NAME_MAX}
                  autoComplete="off"
                />
              )}
            </Field>

            <Field label={text.descriptionLabel} error={errors.description?.message}>
              {(control) => (
                <Textarea
                  {...control}
                  {...register('description')}
                  placeholder={text.descriptionPlaceholder}
                  maxLength={WORKOUT_DESCRIPTION_MAX}
                  rows={2}
                />
              )}
            </Field>
          </Card>
        </section>

        <ExerciseFields />

        <div className="flex items-center gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? text.submitting : submitLabel}
          </Button>

          {onCancel ? (
            <Button
              variant="ghost"
              onClick={() => leaveGuard.guard(onCancel)}
              disabled={isSubmitting}
            >
              {dict.common.cancel}
            </Button>
          ) : null}

          {secondaryAction}
        </div>
      </form>
    </FormProvider>
  )
}
