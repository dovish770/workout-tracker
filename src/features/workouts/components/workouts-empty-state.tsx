import { Dumbbell } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/ui/empty-state'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'

const text = dict.workouts.list.empty

export function WorkoutsEmptyState() {
  return (
    <EmptyState
      icon={<Dumbbell className="size-6" />}
      title={text.title}
      description={text.description}
      action={
        <ButtonLink href={ROUTES.workouts.new} size="sm">
          {text.action}
        </ButtonLink>
      }
    />
  )
}
