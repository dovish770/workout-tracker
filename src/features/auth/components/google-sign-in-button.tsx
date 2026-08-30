'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { signIn } from '@/lib/auth-client'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'

const text = dict.auth

/** Google's mark. Inline because its four brand colours are fixed, not themed. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.14 6.16-4.14Z"
      />
    </svg>
  )
}

export function GoogleSignInButton() {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const toast = useToast()

  async function startSignIn() {
    setIsSigningIn(true)

    // Redirects to Google on success, so the page usually goes away here.
    const { error } = await signIn.social({
      provider: 'google',
      callbackURL: ROUTES.workouts.list,
    })

    if (error) {
      setIsSigningIn(false)
      toast.show(text.signInFailed, 'danger')
    }
  }

  return (
    <Button size="lg" variant="ghost" onClick={startSignIn} isLoading={isSigningIn}>
      {isSigningIn ? null : <GoogleMark />}
      {isSigningIn ? text.signingIn : text.signInWithGoogle}
    </Button>
  )
}
