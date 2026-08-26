'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export interface UnsavedChangesGuard {
  /** The destination being held back, or `null` when nothing is pending. */
  pendingHref: string | null
  /** Leave anyway — navigates to the held destination. */
  confirmLeave: () => void
  /** Stay on the page. */
  cancelLeave: () => void
}

/**
 * Holds back navigation while a page has unsaved work.
 *
 * Two very different exits need covering:
 *
 * - Closing the tab, reloading, or typing a new URL — only `beforeunload` can
 *   interrupt that, and browsers show their own wording; the message cannot be
 *   customised.
 * - Clicking a link inside the app — no page unload happens, so `beforeunload`
 *   never fires. This is caught by one capture-phase listener on the document
 *   rather than by wiring `onNavigate` into every `<Link>`: a guard that each
 *   new link has to opt into is a guard that will eventually be forgotten.
 *
 * Not covered: the browser's back button. Blocking it requires pushing sentinel
 * history entries, which breaks the history stack in worse ways than it helps.
 */
export function useUnsavedChangesGuard(isEnabled: boolean): UnsavedChangesGuard {
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    if (!isEnabled) return

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled) return

    function interceptLinkClick(event: MouseEvent) {
      if (event.defaultPrevented) return

      // Let the browser handle anything that is not a plain left click —
      // middle click and ctrl/cmd+click open a new tab and leave this one,
      // and its unsaved work, exactly where it is.
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#')) return

      const destination = new URL(anchor.href, window.location.href)
      // External links unload the page, so `beforeunload` already covers them.
      if (destination.origin !== window.location.origin) return
      // Same page: nothing is lost.
      if (destination.pathname === window.location.pathname) return

      event.preventDefault()
      // React's delegated handlers sit below the document, so stopping here
      // means `next/link` never even sees the click.
      event.stopPropagation()

      setPendingHref(destination.pathname + destination.search)
    }

    document.addEventListener('click', interceptLinkClick, true)
    return () => document.removeEventListener('click', interceptLinkClick, true)
  }, [isEnabled])

  const confirmLeave = useCallback(() => {
    if (!pendingHref) return

    // Cleared first so the pending state cannot survive the navigation.
    setPendingHref(null)
    router.push(pendingHref)
  }, [pendingHref, router])

  const cancelLeave = useCallback(() => setPendingHref(null), [])

  return { pendingHref, confirmLeave, cancelLeave }
}
