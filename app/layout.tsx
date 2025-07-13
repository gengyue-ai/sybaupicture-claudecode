import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Providers } from '@/components/providers'
import BackgroundUserSync from '@/components/BackgroundUserSync'
import { AuthStateHandler } from '@/components/AuthStateHandler'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sybau Picture - AI Meme Generator',
  description: 'Create amazing Sybau-style memes with AI technology. Free, fast, and fun!',
  keywords: ['AI', 'meme generator', 'Sybau', 'artificial intelligence', 'image generation'],
  authors: [{ name: 'Sybau Picture Team' }],
  creator: 'Sybau Picture',
  publisher: 'Sybau Picture',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sybaupicture.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'zh-CN': '/zh',
    },
  },
  verification: {
    google: '207c6c6d915a05e8',
  },
  openGraph: {
    title: 'Sybau Picture - AI Meme Generator',
    description: 'Create amazing Sybau-style memes with AI technology. Free, fast, and fun!',
    url: 'https://sybaupicture.com',
    siteName: 'Sybau Picture',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sybau Picture - AI Meme Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sybau Picture - AI Meme Generator',
    description: 'Create amazing Sybau-style memes with AI technology. Free, fast, and fun!',
    images: ['/og-image.jpg'],
    creator: '@SybauPicture',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* AdSense脚本通过组件统一管理 */}
      </head>
      <body className={inter.className}>
        <Providers>
          <AuthStateHandler />
          <BackgroundUserSync />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
