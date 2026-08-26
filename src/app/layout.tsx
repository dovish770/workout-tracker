import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import { AppShell } from '@/components/layout/app-shell'
import { APP_DIRECTION, APP_LOCALE, dict } from '@/i18n'
import './globals.css'

const heebo = Heebo({
  variable: '--font-heebo',
  subsets: ['hebrew', 'latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  // Pages set only their own name; the app name is appended here.
  title: { default: dict.meta.title, template: `%s · ${dict.meta.title}` },
  description: dict.meta.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={APP_LOCALE}
      dir={APP_DIRECTION}
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
