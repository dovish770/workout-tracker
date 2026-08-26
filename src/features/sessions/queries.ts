import 'server-only'

import { cache } from 'react'
import { z } from 'zod'
import { sessionRepository } from '@/db/session-repository'
import type { WorkoutSession } from './types'

const idSchema = z.uuid()

/**
 * The one active session, if any. Memoized per request because the header
 * banner and the page body both ask for it.
 */
export const getActiveSession = cache(async (): Promise<WorkoutSession | null> => {
  return sessionRepository.getActive()
})

export const getSessionById = cache(
  async (id: string): Promise<WorkoutSession | null> => {
    if (!idSchema.safeParse(id).success) return null

    return sessionRepository.getById(id)
  },
)
