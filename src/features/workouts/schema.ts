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
 * Numeric fields are `number | null`, never `''` or `NaN`. The form maps a
 * cleared input to `null` on the way in (see `toNullableNumber`), so `null`
 * means "empty" everywhere: allowed on an optional field, and reported as
 * missing rather than as a type error on a required one.
 */
export const exerciseSchema = z.object({
  /**
   * Identifies a row across edits. An existing exercise sends its id back so
   * it survives a save; a newly added one has none and gets one here, at
   * validation time — never during render, which would bake a fixed id into
   * the prerendered "new workout" page.
   */
  id: z.uuid().default(() => crypto.randomUUID()),

  name: z
    .string()
    .trim()
    .min(1, { error: message.exerciseNameRequired })
    .max(EXERCISE_NAME_MAX, { error: message.exerciseNameTooLong(EXERCISE_NAME_MAX) }),

  // `null` fails the type check here, which is what surfaces "required".
  sets: z
    .number({ error: message.setsRequired })
    .int({ error: message.setsInteger })
    .min(SETS_MIN, { error: message.setsRange(SETS_MIN, SETS_MAX) })
    .max(SETS_MAX, { error: message.setsRange(SETS_MIN, SETS_MAX) }),

  reps: z
    .number({ error: message.repsInteger })
    .int({ error: message.repsInteger })
    .min(REPS_MIN, { error: message.repsRange(REPS_MIN, REPS_MAX) })
    .max(REPS_MAX, { error: message.repsRange(REPS_MIN, REPS_MAX) })
    .nullable(),

  maxWeight: z
    .number({ error: message.weightRange(WEIGHT_MIN, WEIGHT_MAX) })
    .min(WEIGHT_MIN, { error: message.weightRange(WEIGHT_MIN, WEIGHT_MAX) })
    .max(WEIGHT_MAX, { error: message.weightRange(WEIGHT_MIN, WEIGHT_MAX) })
    .nullable(),
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

/**
 * The list view's read model. It needs how many exercises a workout has, never
 * what they are — so the query counts them in the database instead of shipping
 * every exercise of every workout to render a number.
 */
export type WorkoutSummary = Omit<Workout, 'exercises'> & { exerciseCount: number }
