import 'server-only'

import { cache } from 'react'
import { createWorkoutRepository } from '@/db/repository'
import { requireUser } from '@/features/auth/require-user'

/**
 * The workout repository bound to whoever is signed in.
 *
 * This is the only way the rest of the app obtains one, which is what makes
 * "filter by the current user" impossible to forget: there is no unscoped
 * repository to reach for.
 */
export const getWorkoutRepository = cache(async () => {
  const user = await requireUser()
  return createWorkoutRepository(user.id)
})
