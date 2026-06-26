import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { JarvisProvider } from '@/components/jarvis/VoiceAssistant'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'XENA AI Control Hub',
  description: 'Universal AI Desktop Assistant',
  keywords: ['AI', 'assistant', 'desktop', 'automation', 'voice'],
  authors: [{ name: 'XENA' }],
  applicationName: 'XENA AI Control Hub',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020617',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <div className="scanline-overlay" />
        <JarvisProvider>
          {children}
        </JarvisProvider>
      </body>
    </html>
  )
}
