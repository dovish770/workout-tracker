import type { z } from 'zod'
import { SETS_DEFAULT } from './constants'
import type { Workout, workoutInputSchema } from './schema'

/**
 * What the form holds while the user is typing: the schema's *input* side.
 *
 * Derived rather than hand-written, so the resolver, the field paths and these
 * values can never drift apart. It differs from `WorkoutInput` in exactly one
 * way — a not-yet-saved exercise has no id, because the schema mints one
 * during validation.
 */
export type WorkoutFormValues = z.input<typeof workoutInputSchema>

export type ExerciseFormValues = WorkoutFormValues['exercises'][number]

export function createEmptyExercise(): ExerciseFormValues {
  return { name: '', sets: SETS_DEFAULT, reps: null, maxWeight: null }
}

/** A blank workout always starts with one exercise row — never an empty list. */
export function createEmptyWorkout(): WorkoutFormValues {
  return { name: '', description: '', exercises: [createEmptyExercise()] }
}

export function toFormValues(workout: Workout): WorkoutFormValues {
  return {
    name: workout.name,
    description: workout.description,
    exercises: workout.exercises.map((exercise) => ({ ...exercise })),
  }
}

/**
 * `register`'s parser for numeric inputs. `valueAsNumber` yields `NaN` for a
 * cleared field, which is neither a number nor a usable "empty" — `null` is,
 * and it is what the schema treats as missing.
 */
export function toNullableNumber(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}
