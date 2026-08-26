'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * `localStorage` as a React external store.
 *
 * `useSyncExternalStore` rather than "read it in an effect and call setState":
 * it gives a proper server snapshot, so hydration matches without a flash, and
 * it avoids the cascading render that reading-then-setting causes.
 *
 * Writes notify listeners in this tab; the `storage` event covers other tabs.
 */
export type StorageArea = 'local' | 'session'

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function areaOf(area: StorageArea): Storage {
  return area === 'session' ? window.sessionStorage : window.localStorage
}

function read(key: string, area: StorageArea): string | null {
  try {
    return areaOf(area).getItem(key)
  } catch {
    // Private mode and blocked site data both throw. The caller still works;
    // the value simply does not persist.
    return null
  }
}

export function useStoredValue(
  key: string,
  area: StorageArea = 'local',
): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, area),
    // Server snapshot: there is no storage, so callers fall back to a default.
    () => null,
  )

  const setValue = useCallback(
    (next: string | null) => {
      try {
        if (next === null) areaOf(area).removeItem(key)
        else areaOf(area).setItem(key, next)
      } catch {
        /* as above */
      }

      emitChange()
    },
    [key, area],
  )

  return [value, setValue]
}
