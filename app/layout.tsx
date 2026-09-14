import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'INVOXA — Create. Customize. Send. Get Paid.',
  description:
    'A high-performance invoice workspace designed for freelancers, agencies, consultants, and modern businesses. Built with Indian GST, UPI QR payments, and live A4 design preview.',
  icons: {
    icon: [
      {
        url: '/icon.svg?v=2',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-light-32x32.png?v=2',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png?v=2',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png?v=2',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F17' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
