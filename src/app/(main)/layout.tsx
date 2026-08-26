import { AppShell } from '@/components/layout/app-shell'
import { ActiveSessionBanner } from '@/features/sessions/components/active-session-banner'
import { SessionEntryGate } from '@/features/sessions/components/session-entry-gate'

/**
 * Everything the app normally shows lives in this group: header, nav and the
 * page container. The group is organisational only — no URL contains `(main)`.
 */
export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <AppShell banner={<ActiveSessionBanner />}>
      {/* Layouts do not re-render on navigation, so this mounts once a visit. */}
      <SessionEntryGate />
      {children}
    </AppShell>
  )
}
