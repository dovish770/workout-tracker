/**
 * Focus mode: the running-workout screen and nothing else.
 *
 * Deliberately outside the app shell — no header, no nav, no page container.
 * A workout screen glanced at between sets should hold one thought, and every
 * other control on it is a chance to tap the wrong thing. Leaving is a single
 * explicit control on the screen itself.
 */
export default function FocusLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="bg-bg flex min-h-dvh flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {children}
    </div>
  )
}
