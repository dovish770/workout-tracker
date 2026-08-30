'use client'

import { createAuthClient } from 'better-auth/react'

/**
 * The browser half of Better Auth.
 *
 * No base URL: the client talks to the same origin it was served from, which
 * is what makes the same build work on localhost and on the deployment.
 */
export const authClient = createAuthClient()

export const { signIn, signOut, useSession } = authClient
