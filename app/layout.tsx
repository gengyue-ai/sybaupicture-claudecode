import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Providers } from '@/components/providers'
import BackgroundUserSync from '@/components/BackgroundUserSync'
import { AuthStateHandler } from '@/components/AuthStateHandler'
import { GooglePageAds } from '@/components/GoogleAds'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sybau Picture - AI Image Generator | Stay Young, Beautiful & Unique',
  description: 'Create amazing Sybau-style images with AI technology. Transform text and images into stunning creative visuals. Free, fast, and fun!',
  keywords: ['AI', 'image generator', 'Sybau', 'artificial intelligence', 'image generation', 'creative AI', 'meme generator', 'AI art'],
  authors: [{ name: 'Sybau Picture Team' }],
  creator: 'Sybau Picture',
  publisher: 'Sybau Picture',
  applicationName: 'Sybau Picture',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sybaupicture.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'zh-CN': '/zh',
    },
  },
  verification: {
    google: '207c6c6d915a05e8',
  },
  openGraph: {
    title: 'Sybau Picture - AI Image Generator',
    description: 'Create amazing Sybau-style images with AI technology. Transform text and images into stunning creative visuals.',
    url: 'https://sybaupicture.com',
    siteName: 'Sybau Picture',
    images: [
      {
        url: '/logo-600x600.svg',
        width: 600,
        height: 600,
        alt: 'Sybau Picture Logo - AI Image Generator',
      },
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sybau Picture - AI Image Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sybau Picture - AI Image Generator',
    description: 'Create amazing Sybau-style images with AI technology. Transform text and images into stunning creative visuals.',
    images: ['/logo-600x600.svg'],
    creator: '@SybauPicture',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
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
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-icon.svg" />
        
        {/* 结构化数据 - 谷歌Logo索引 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sybau Picture",
              "alternateName": ["SP", "Sybau"],
              "url": "https://sybaupicture.com",
              "logo": [
                {
                  "@type": "ImageObject",
                  "url": "https://sybaupicture.com/logo-600x600.svg",
                  "width": 600,
                  "height": 600,
                  "caption": "Sybau Picture Logo"
                },
                {
                  "@type": "ImageObject", 
                  "url": "https://sybaupicture.com/logo-600x60.svg",
                  "width": 600,
                  "height": 60,
                  "caption": "Sybau Picture Horizontal Logo"
                }
              ],
              "sameAs": [
                "https://sybaupicture.com",
                "https://sybaupicture.com/zh"
              ],
              "description": "Stay Young, Beautiful & Unique - AI Image Generation Platform",
              "slogan": "Stay Young, Beautiful & Unique",
              "founder": {
                "@type": "Organization",
                "name": "Gengyue AI"
              },
              "foundingDate": "2024",
              "knowsAbout": [
                "AI Image Generation",
                "Artificial Intelligence",
                "Creative Technology",
                "Meme Generation"
              ],
              "potentialAction": {
                "@type": "CreateAction",
                "name": "Generate AI Images",
                "target": "https://sybaupicture.com"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <GooglePageAds />
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
