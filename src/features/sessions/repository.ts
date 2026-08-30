import 'server-only'

import { cache } from 'react'
import { createSessionRepository } from '@/db/session-repository'
import { requireUser } from '@/features/auth/require-user'

/** The session repository bound to whoever is signed in. See workouts/repository.ts. */
export const getSessionRepository = cache(async () => {
  const user = await requireUser()
  return createSessionRepository(user.id)
})
