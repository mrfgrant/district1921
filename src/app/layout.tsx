import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'District 1921 — Community Business Directory',
    template: '%s | District 1921',
  },
  description: 'Discover and support community businesses across all 50 states.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://district1921.com'),
  openGraph: {
    type: 'website',
    siteName: 'District 1921',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#C9A84C',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
