'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { signOut } from '@/lib/auth-client'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'
import type { CurrentUser } from '../queries'

const text = dict.auth

export interface AccountMenuProps {
  user: CurrentUser
}

/**
 * Who is signed in, and the way out.
 *
 * The name is hidden on narrow screens: on a phone the header has to leave
 * room for navigation, and the sign-out control is the part that must stay
 * reachable.
 */
export function AccountMenu({ user }: AccountMenuProps) {
  const [isSigningOut, startSigningOut] = useTransition()
  const router = useRouter()
  const toast = useToast()

  function handleSignOut() {
    startSigningOut(async () => {
      const { error } = await signOut()
      if (error) {
        toast.show(dict.errors.generic, 'danger')
        return
      }

      // Refresh as well as navigate: the server components above still hold
      // the signed-in render until their cache is dropped.
      router.replace(ROUTES.auth.login)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted hidden max-w-32 truncate text-xs sm:inline">
        {text.signedInAs(user.name)}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        isLoading={isSigningOut}
        aria-label={text.signOut}
      >
        <LogOut className="size-4 rtl:-scale-x-100" aria-hidden />
        <span className="hidden sm:inline">{text.signOut}</span>
      </Button>
    </div>
  )
}
