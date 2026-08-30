import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
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
        {/* Above the route groups, so focus mode gets toasts too. */}
        <ToastProvider
          regionLabel={dict.a11y.notifications}
          dismissLabel={dict.a11y.dismiss}
        >
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
