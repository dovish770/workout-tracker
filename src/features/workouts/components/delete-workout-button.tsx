'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { dict } from '@/i18n'
import { deleteWorkout } from '../actions'

const text = dict.workouts.confirmDelete

export interface DeleteWorkoutButtonProps {
  workoutId: string
}

export function DeleteWorkoutButton({ workoutId }: DeleteWorkoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirmDelete() {
    setError(null)
    setIsDeleting(true)

    // On success the action redirects, so nothing below runs.
    const result = await deleteWorkout(workoutId)

    setIsDeleting(false)
    if (!result.ok) setError(result.error)
  }

  function closeDialog() {
    setIsOpen(false)
    setError(null)
  }

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        <Trash2 className="size-4" aria-hidden />
        {dict.common.delete}
      </Button>

      <ConfirmDialog
        isOpen={isOpen}
        title={text.title}
        description={text.description}
        confirmLabel={text.confirm}
        cancelLabel={dict.common.cancel}
        onConfirm={confirmDelete}
        onCancel={closeDialog}
        isConfirming={isDeleting}
        error={error ?? undefined}
      />
    </>
  )
}
