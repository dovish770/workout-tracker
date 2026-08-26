'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export interface UnsavedChangesGuard {
  /** True while the user is being asked to confirm. */
  isPrompting: boolean
  /** Leave anyway — runs whatever was held back. */
  confirmLeave: () => void
  /** Stay put. */
  cancelLeave: () => void
  /**
   * Route a non-navigating exit — closing an inline editor, say — through the
   * same prompt. Runs immediately when there is nothing to lose.
   */
  guard: (leave: () => void) => void
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

  // Held as a thunk rather than a destination, so the same prompt can gate a
  // navigation and an in-page state change alike.
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null)

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

      const destinationHref = destination.pathname + destination.search
      // Wrapped: a bare function passed to setState would be run as an updater.
      setPendingLeave(() => () => router.push(destinationHref))
    }

    document.addEventListener('click', interceptLinkClick, true)
    return () => document.removeEventListener('click', interceptLinkClick, true)
  }, [isEnabled, router])

  const confirmLeave = useCallback(() => {
    if (!pendingLeave) return

    // Cleared first, so the pending state cannot outlive the navigation.
    setPendingLeave(null)
    pendingLeave()
  }, [pendingLeave])

  const cancelLeave = useCallback(() => setPendingLeave(null), [])

  const guard = useCallback(
    (leave: () => void) => {
      if (!isEnabled) {
        leave()
        return
      }

      setPendingLeave(() => leave)
    },
    [isEnabled],
  )

  return { isPrompting: pendingLeave !== null, confirmLeave, cancelLeave, guard }
}
