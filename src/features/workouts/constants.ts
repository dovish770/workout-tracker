/**
 * Every numeric limit and default for the workout domain.
 *
 * Validation (`schema.ts`), form defaults, and input `min`/`max`/`step`
 * attributes all read from here, so a rule changes in exactly one place.
 */

export const WORKOUT_NAME_MAX = 60
export const WORKOUT_DESCRIPTION_MAX = 140

export const EXERCISE_NAME_MAX = 80
export const EXERCISES_MIN = 1

export const SETS_MIN = 1
export const SETS_MAX = 50
export const SETS_DEFAULT = 3

export const REPS_MIN = 1
export const REPS_MAX = 200

export const WEIGHT_MIN = 0
export const WEIGHT_MAX = 1000
export const WEIGHT_STEP = 0.5

/**
 * The rest durations offered in the form, in seconds. `null` means no timer.
 *
 * Kept here rather than as a database enum: these are a product choice, and
 * changing them should not require a migration or invalidate stored rows.
 */
export const REST_OPTIONS_SECONDS = [90, 120] as const

export const REST_MIN = 15
export const REST_MAX = 600
