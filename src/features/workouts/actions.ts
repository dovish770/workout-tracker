'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { workoutRepository } from '@/db/repository'
import { dict } from '@/i18n'
import { fail, ok, toFieldErrors, type ActionResult } from '@/lib/result'
import { ROUTES } from '@/lib/routes'
import { workoutInputSchema } from './schema'

const idSchema = z.uuid()

/**
 * Every mutation re-validates its payload here. Client-side validation is a
 * UX affordance; an action is a public endpoint and must not trust its input.
 *
 * `redirect()` works by throwing, so it is always called after the try/catch —
 * inside one, the catch would swallow the navigation.
 */

export async function createWorkout(input: unknown): Promise<ActionResult<never>> {
  const parsed = workoutInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail(dict.errors.generic, toFieldErrors(parsed.error.issues))
  }

  let createdId: string
  try {
    const workout = await workoutRepository.create(parsed.data)
    createdId = workout.id
  } catch (error) {
    console.error('createWorkout failed', error)
    return fail(dict.errors.generic)
  }

  revalidatePath(ROUTES.workouts.list)
  redirect(ROUTES.workouts.detail(createdId))
}

export async function updateWorkout(
  id: string,
  input: unknown,
): Promise<ActionResult<void>> {
  if (!idSchema.safeParse(id).success) return fail(dict.errors.notFound)

  const parsed = workoutInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail(dict.errors.generic, toFieldErrors(parsed.error.issues))
  }

  try {
    const workout = await workoutRepository.update(id, parsed.data)
    if (!workout) return fail(dict.errors.notFound)
  } catch (error) {
    console.error('updateWorkout failed', error)
    return fail(dict.errors.generic)
  }

  revalidatePath(ROUTES.workouts.list)
  revalidatePath(ROUTES.workouts.detail(id))

  // Editing happens in place, so the caller stays on the page.
  return ok(undefined)
}

export async function deleteWorkout(id: string): Promise<ActionResult<never>> {
  if (!idSchema.safeParse(id).success) return fail(dict.errors.notFound)

  try {
    const wasDeleted = await workoutRepository.remove(id)
    if (!wasDeleted) return fail(dict.errors.notFound)
  } catch (error) {
    console.error('deleteWorkout failed', error)
    return fail(dict.errors.generic)
  }

  revalidatePath(ROUTES.workouts.list)
  redirect(ROUTES.workouts.list)
}
