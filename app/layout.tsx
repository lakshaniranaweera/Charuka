import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SettingsProvider } from '@/components/providers/settings-provider'
import { getInitialSettings } from '@/lib/supabase/queries'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Activation Planner',
    template: '%s · Activation Planner',
  },
  description:
    'Premium enterprise activation event planning dashboard — real-time, secure, and beautifully designed.',
  keywords: ['activation', 'events', 'planner', 'dashboard', 'enterprise'],
  authors: [{ name: 'Activation Planner' }],
  openGraph: {
    title: 'Activation Planner',
    description: 'Premium enterprise activation event planning dashboard.',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1120' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialSettings = await getInitialSettings()

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider initialSettings={initialSettings}>
            {children}
            <Toaster
              richColors
              position="top-right"
              toastOptions={{ className: 'rounded-xl' }}
            />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
