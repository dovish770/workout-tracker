import { AppShell } from '@/components/layout/app-shell'
import { ActiveSessionBanner } from '@/features/sessions/components/active-session-banner'

/**
 * Everything the app normally shows lives in this group: header, nav and the
 * page container. The group is organisational only — no URL contains `(main)`.
 */
export default function MainLayout({ children }: LayoutProps<'/'>) {
  return <AppShell banner={<ActiveSessionBanner />}>{children}</AppShell>
}
