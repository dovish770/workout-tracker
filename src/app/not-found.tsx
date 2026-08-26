import { Compass } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/ui/empty-state'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'

export default function NotFound() {
  return (
    <EmptyState
      icon={<Compass className="size-6" />}
      title={dict.errors.notFound}
      description={dict.errors.notFoundDescription}
      action={
        <ButtonLink href={ROUTES.workouts.list} size="sm">
          {dict.errors.backHome}
        </ButtonLink>
      }
    />
  )
}
