import { SearchX } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/ui/empty-state'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'

const text = dict.workouts.detail

export default function WorkoutNotFound() {
  return (
    <EmptyState
      icon={<SearchX className="size-6" />}
      title={text.notFoundTitle}
      description={text.notFoundDescription}
      action={
        <ButtonLink href={ROUTES.workouts.list} size="sm">
          {text.backToList}
        </ButtonLink>
      }
    />
  )
}
