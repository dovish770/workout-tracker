/**
 * The signed-out world: no header, no nav, nothing to click but signing in.
 */
export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="bg-bg flex min-h-dvh flex-col items-center justify-center px-6">
      {children}
    </div>
  )
}
