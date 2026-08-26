import { z } from 'zod'
import { dict } from '@/i18n'
import {
  EXERCISES_MIN,
  EXERCISE_NAME_MAX,
  REPS_MAX,
  REPS_MIN,
  SETS_MAX,
  SETS_MIN,
  WEIGHT_MAX,
  WEIGHT_MIN,
  WORKOUT_DESCRIPTION_MAX,
  WORKOUT_NAME_MAX,
} from './constants'

const message = dict.workouts.validation

/**
 * A cleared number input hands back `''`, and `valueAsNumber` turns that into
 * `NaN`. Both mean "the user typed nothing" — collapse them to `undefined` so
 * a required field reports "missing" rather than "not a number", and an
 * optional one can become `null`.
 */
function normalizeNumberInput(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) return undefined
  if (typeof value === 'number' && Number.isNaN(value)) return undefined
  return value
}

/** Optional numeric field: absent, or a number inside the given bounds. */
function optionalNumber(schema: z.ZodType<number>) {
  return z.preprocess((value) => normalizeNumberInput(value) ?? null, schema.nullable())
}

export const exerciseSchema = z.object({
  // Generated on the client so a row keeps its identity across reordering.
  id: z.uuid(),

  name: z
    .string()
    .trim()
    .min(1, { error: message.exerciseNameRequired })
    .max(EXERCISE_NAME_MAX, { error: message.exerciseNameTooLong(EXERCISE_NAME_MAX) }),

  sets: z.preprocess(
    normalizeNumberInput,
    z
      .number({ error: message.setsRequired })
      .int({ error: message.setsInteger })
      .min(SETS_MIN, { error: message.setsRange(SETS_MIN, SETS_MAX) })
      .max(SETS_MAX, { error: message.setsRange(SETS_MIN, SETS_MAX) }),
  ),

  reps: optionalNumber(
    z
      .number({ error: message.repsInteger })
      .int({ error: message.repsInteger })
      .min(REPS_MIN, { error: message.repsRange(REPS_MIN, REPS_MAX) })
      .max(REPS_MAX, { error: message.repsRange(REPS_MIN, REPS_MAX) }),
  ),

  maxWeight: optionalNumber(
    z
      .number({ error: message.weightRange(WEIGHT_MIN, WEIGHT_MAX) })
      .min(WEIGHT_MIN, { error: message.weightRange(WEIGHT_MIN, WEIGHT_MAX) })
      .max(WEIGHT_MAX, { error: message.weightRange(WEIGHT_MIN, WEIGHT_MAX) }),
  ),
})

/** Everything a user can supply — the payload of both create and update. */
export const workoutInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: message.nameRequired })
    .max(WORKOUT_NAME_MAX, { error: message.nameTooLong(WORKOUT_NAME_MAX) }),

  description: z
    .string()
    .trim()
    .max(WORKOUT_DESCRIPTION_MAX, {
      error: message.descriptionTooLong(WORKOUT_DESCRIPTION_MAX),
    }),

  // Array order is display order; there is no separate position field.
  exercises: z.array(exerciseSchema).min(EXERCISES_MIN, { error: message.exercisesMin }),
})

/** A stored workout: the input plus the columns the database owns. */
export const workoutSchema = workoutInputSchema.extend({
  id: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Exercise = z.infer<typeof exerciseSchema>
export type WorkoutInput = z.infer<typeof workoutInputSchema>
export type Workout = z.infer<typeof workoutSchema>
