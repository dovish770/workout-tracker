import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import { APP_DIRECTION, APP_LOCALE, dict } from '@/i18n'
import './globals.css'

const heebo = Heebo({
  variable: '--font-heebo',
  subsets: ['hebrew', 'latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: dict.meta.title,
  description: dict.meta.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={APP_LOCALE}
      dir={APP_DIRECTION}
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
