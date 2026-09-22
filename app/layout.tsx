import { Analytics } from '@vercel/analytics/next'
import { Inter, Playfair_Display } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { CartProvider } from '@/components/cart/cart-context'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { FloatingButtons } from '@/components/layout/floating-buttons'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'KwaiSpress — Productos seleccionados, atención directa',
  description:
    'Marketplace con productos verificados de vendedores de confianza.',
  generator: 'KwaiSpress',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`dark ${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <FloatingButtons />
          </CartProvider>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}