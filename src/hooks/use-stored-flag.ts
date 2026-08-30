'use client'

import { useCallback } from 'react'
import { useStoredValue, type StorageArea } from './use-stored-value'

/** A boolean preference that outlives a reload. */
export function useStoredFlag(
  storageKey: string,
  defaultValue: boolean,
  area: StorageArea = 'local',
): [boolean, (value: boolean) => void] {
  const [raw, setRaw] = useStoredValue(storageKey, area)

  const setValue = useCallback((next: boolean) => setRaw(String(next)), [setRaw])

  return [raw === null ? defaultValue : raw === 'true', setValue]
}
