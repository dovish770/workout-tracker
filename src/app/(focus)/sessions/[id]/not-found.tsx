import { ButtonLink } from '@/components/ui/button-link'
import { FocusScreen } from '@/components/ui/focus-screen'
import { dict } from '@/i18n'
import { ROUTES } from '@/lib/routes'

const text = dict.sessions.errors

export default function SessionNotFound() {
  return (
    <FocusScreen
      title={text.notFoundTitle}
      subtitle={text.notFoundDescription}
      action={
        <ButtonLink size="lg" variant="ghost" href={ROUTES.workouts.list}>
          {dict.sessions.run.backToWorkouts}
        </ButtonLink>
      }
    />
  )
}
