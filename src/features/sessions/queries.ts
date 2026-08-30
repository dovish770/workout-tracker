import 'server-only'

import { cache } from 'react'
import { z } from 'zod'
import { getSessionRepository } from './repository'
import type { WorkoutSession } from './types'

const idSchema = z.uuid()

/**
 * The one active session, if any. Memoized per request because the header
 * banner and the page body both ask for it.
 */
export const getActiveSession = cache(async (): Promise<WorkoutSession | null> => {
  const repository = await getSessionRepository()
  return repository.getActive()
})

export const getSessionById = cache(
  async (id: string): Promise<WorkoutSession | null> => {
    if (!idSchema.safeParse(id).success) return null

    const repository = await getSessionRepository()
    return repository.getById(id)
  },
)
