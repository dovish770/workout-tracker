'use client'

import { Check, Pencil, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { WEIGHT_MAX, WEIGHT_MIN, WEIGHT_STEP } from '@/features/workouts/constants'
import { dict } from '@/i18n'
import { formatNumber } from '@/lib/format'
import { setSessionMaxWeight } from '../actions'

const text = dict.sessions.run

export interface MaxWeightHeaderProps {
  sessionId: string
  sessionExerciseId: string
  maxWeight: number | null
}

/**
 * The one persistent line on the set screen, and the only editable thing on it.
 *
 * A new personal best is discovered mid-set, so recording it has to be two taps
 * from where the eyes already are — not a trip back to the edit form.
 */
export function MaxWeightHeader({
  sessionId,
  sessionExerciseId,
  maxWeight,
}: MaxWeightHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [isSaving, startSaving] = useTransition()
  const toast = useToast()

  function beginEditing() {
    setDraft(maxWeight === null ? '' : String(maxWeight))
    setIsEditing(true)
  }

  function save() {
    const trimmed = draft.trim()
    const value = trimmed === '' ? null : Number(trimmed)
    if (value !== null && Number.isNaN(value)) return

    startSaving(async () => {
      const result = await setSessionMaxWeight(sessionId, sessionExerciseId, value)

      if (result.ok) {
        setIsEditing(false)
        toast.show(text.maxWeightSaved)
        return
      }

      toast.show(result.error, 'danger')
    })
  }

  if (!isEditing) {
    return (
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-center gap-2 px-4">
        <span className="text-muted text-sm">{text.maxWeightLabel}</span>
        <span className="text-sm font-medium tabular-nums">
          {maxWeight === null
            ? text.maxWeightNone
            : `${formatNumber(maxWeight)} ${text.weightUnit}`}
        </span>
        <IconButton
          label={text.editMaxWeight}
          icon={<Pencil className="size-4" />}
          onClick={beginEditing}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-center gap-2 px-4">
      <label htmlFor="session-max-weight" className="text-muted text-sm">
        {text.maxWeightLabel}
      </label>

      <Input
        id="session-max-weight"
        autoFocus
        type="number"
        inputMode="decimal"
        min={WEIGHT_MIN}
        max={WEIGHT_MAX}
        step={WEIGHT_STEP}
        value={draft}
        placeholder={text.weightPlaceholder}
        disabled={isSaving}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') save()
          if (event.key === 'Escape') setIsEditing(false)
        }}
        className="h-9 w-28 text-center"
      />

      <IconButton
        label={dict.common.save}
        icon={<Check className="size-4" />}
        onClick={save}
        disabled={isSaving}
      />
      <IconButton
        label={dict.common.cancel}
        icon={<X className="size-4" />}
        onClick={() => setIsEditing(false)}
        disabled={isSaving}
      />
    </div>
  )
}
