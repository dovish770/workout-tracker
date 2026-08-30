import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Dumbbell } from 'lucide-react'
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button'
import { getCurrentUser } from '@/features/auth/queries'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'

export const metadata: Metadata = { title: dict.auth.signInWithGoogle }

/** Reads the session cookie, so it cannot be prerendered. */
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // Already signed in: nothing to do here.
  const user = await getCurrentUser()
  if (user) redirect(ROUTES.workouts.list)

  return (
    <main className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <Dumbbell className="text-accent size-8" aria-hidden />
        <h1 className="text-3xl font-semibold tracking-tight">{dict.auth.loginTitle}</h1>
        <p className="text-muted text-sm">{dict.auth.loginSubtitle}</p>
      </div>

      <div className="w-full [&>*]:w-full">
        <GoogleSignInButton />
      </div>
    </main>
  )
}
