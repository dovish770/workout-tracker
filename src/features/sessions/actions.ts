'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { sessionRepository } from '@/db/session-repository'
import { dict } from '@/i18n'
import { fail, ok, type ActionResult } from '@/lib/result'
import { ROUTES } from '@/lib/routes'
import { WEIGHT_MAX, WEIGHT_MIN } from '@/features/workouts/constants'

const idSchema = z.uuid()

const message = dict.sessions.errors

/** Same bounds as the workout form — this writes to the same column. */
const weightSchema = z
  .number({ error: dict.workouts.validation.weightRange(WEIGHT_MIN, WEIGHT_MAX) })
  .min(WEIGHT_MIN, {
    error: dict.workouts.validation.weightRange(WEIGHT_MIN, WEIGHT_MAX),
  })
  .max(WEIGHT_MAX, {
    error: dict.workouts.validation.weightRange(WEIGHT_MIN, WEIGHT_MAX),
  })
  .nullable()

/** Both the session page and the list header react to a session changing. */
function revalidateSession(sessionId: string) {
  revalidatePath(ROUTES.sessions.detail(sessionId))
  revalidatePath(ROUTES.workouts.list)
}

export async function startSession(workoutId: string): Promise<ActionResult<never>> {
  if (!idSchema.safeParse(workoutId).success) return fail(dict.errors.notFound)

  // Checked before inserting so the common case gets a real explanation; the
  // partial unique index is what actually prevents two active sessions.
  const active = await sessionRepository.getActive()
  if (active) return fail(message.alreadyActive)

  let sessionId: string
  try {
    const session = await sessionRepository.start(workoutId)
    if (!session) return fail(message.cannotStart)

    sessionId = session.id
  } catch (error) {
    console.error('startSession failed', error)
    return fail(dict.errors.generic)
  }

  revalidatePath(ROUTES.workouts.list)
  redirect(ROUTES.sessions.detail(sessionId))
}

export async function completeSet(
  sessionId: string,
  sessionExerciseId: string,
): Promise<ActionResult<void>> {
  return moveSet(sessionId, sessionExerciseId, 'complete')
}

export async function undoSet(
  sessionId: string,
  sessionExerciseId: string,
): Promise<ActionResult<void>> {
  return moveSet(sessionId, sessionExerciseId, 'undo')
}

async function moveSet(
  sessionId: string,
  sessionExerciseId: string,
  direction: 'complete' | 'undo',
): Promise<ActionResult<void>> {
  if (!idSchema.safeParse(sessionId).success) return fail(dict.errors.notFound)
  if (!idSchema.safeParse(sessionExerciseId).success) return fail(dict.errors.notFound)

  try {
    const session =
      direction === 'complete'
        ? await sessionRepository.completeSet(sessionId, sessionExerciseId)
        : await sessionRepository.undoSet(sessionId, sessionExerciseId)

    if (!session) return fail(message.notActive)
  } catch (error) {
    console.error('moveSet failed', error)
    return fail(dict.errors.generic)
  }

  revalidateSession(sessionId)
  return ok(undefined)
}

export async function setSessionMaxWeight(
  sessionId: string,
  sessionExerciseId: string,
  maxWeight: number | null,
): Promise<ActionResult<void>> {
  if (!idSchema.safeParse(sessionId).success) return fail(dict.errors.notFound)
  if (!idSchema.safeParse(sessionExerciseId).success) return fail(dict.errors.notFound)

  const parsed = weightSchema.safeParse(maxWeight)
  if (!parsed.success) return fail(parsed.error.issues[0].message)

  try {
    const session = await sessionRepository.setMaxWeight(
      sessionId,
      sessionExerciseId,
      parsed.data,
    )
    if (!session) return fail(dict.errors.notFound)
  } catch (error) {
    console.error('setSessionMaxWeight failed', error)
    return fail(dict.errors.generic)
  }

  revalidateSession(sessionId)
  // The workout's own pages show the weight too, and it just changed.
  revalidatePath(ROUTES.workouts.list, 'layout')
  return ok(undefined)
}

export async function finishSession(sessionId: string): Promise<ActionResult<void>> {
  return endSession(sessionId, 'completed')
}

export async function abandonSession(sessionId: string): Promise<ActionResult<never>> {
  const result = await endSession(sessionId, 'abandoned')
  if (!result.ok) return result

  redirect(ROUTES.workouts.list)
}

async function endSession(
  sessionId: string,
  status: 'completed' | 'abandoned',
): Promise<ActionResult<void>> {
  if (!idSchema.safeParse(sessionId).success) return fail(dict.errors.notFound)

  try {
    const session = await sessionRepository.finish(sessionId, status)
    if (!session) return fail(message.notActive)
  } catch (error) {
    console.error('endSession failed', error)
    return fail(dict.errors.generic)
  }

  revalidateSession(sessionId)
  return ok(undefined)
}
