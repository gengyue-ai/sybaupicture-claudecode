import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Providers } from '@/components/providers'
import BackgroundUserSync from '@/components/BackgroundUserSync'
import { AuthStateHandler } from '@/components/AuthStateHandler'
import { GooglePageAds } from '@/components/GoogleAds'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sybau Picture - FLUX Pro AI Picture Generator | Kontext Engine Powered',
  description: 'Professional AI picture generator powered by FLUX Pro and Kontext engine. Transform images with Sybau style - 9 AI scenarios, 15s generation, commercial quality results.',
  keywords: ['FLUX Pro', 'Kontext AI', 'picture generator', 'Sybau', 'AI image editor', 'flux-pro/kontext', 'professional AI editing', 'AI picture generation', 'flux pro picture generator', 'sybau picture generator'],
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
    title: 'Sybau Picture - FLUX Pro AI Picture Generator',
    description: 'Professional AI picture generator powered by FLUX Pro and Kontext engine. Transform images with Sybau style - 9 AI scenarios, commercial quality.',
    url: 'https://sybaupicture.com',
    siteName: 'Sybau Picture',
    images: [
      {
        url: '/logo.svg',
        width: 120,
        height: 120,
        alt: 'Sybau Picture Logo - AI Image Generator',
      },
      {
        url: '/logo.svg',
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
    title: 'Sybau Picture - FLUX Pro Picture Generator',
    description: 'Professional AI picture generator powered by FLUX Pro and Kontext engine. Transform images with Sybau style - 9 AI scenarios.',
    images: ['/logo.svg'],
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
        
        {/* 结构化数据 - Organization & SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Sybau Picture",
                "alternateName": ["SP", "Sybau", "FLUX Pro Picture Generator"],
                "url": "https://sybaupicture.com",
                "logo": [
                  {
                    "@type": "ImageObject",
                    "url": "https://sybaupicture.com/logo.svg",
                    "width": 120,
                    "height": 120,
                    "caption": "Sybau FLUX Pro Picture Generator Logo"
                  }
                ],
                "sameAs": [
                  "https://sybaupicture.com",
                  "https://sybaupicture.com/zh"
                ],
                "description": "Professional AI picture generator powered by FLUX Pro and Kontext engine",
                "slogan": "Stay Young, Beautiful & Unique",
                "founder": {
                  "@type": "Organization",
                  "name": "Gengyue AI"
                },
                "foundingDate": "2024",
                "knowsAbout": [
                  "FLUX Pro AI Engine",
                  "Kontext Technology",
                  "AI Picture Generation",
                  "Professional Image Editing",
                  "Creative AI Tools"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Sybau Picture - FLUX Pro Generator",
                "applicationCategory": "AI Image Editor",
                "operatingSystem": "Web Browser",
                "url": "https://sybaupicture.com",
                "description": "Professional AI picture generator powered by FLUX Pro and Kontext engine with 9 specialized templates",
                "featureList": [
                  "FLUX Pro AI Engine",
                  "Kontext Technology",
                  "9 Professional Templates",
                  "15-second Generation",
                  "Commercial Quality Output",
                  "Multi-language Support"
                ],
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "description": "Free tier with 3 templates available"
                },
                "creator": {
                  "@type": "Organization",
                  "name": "Sybau Picture Team"
                },
                "potentialAction": {
                  "@type": "CreateAction",
                  "name": "Generate FLUX Pro Images",
                  "target": "https://sybaupicture.com"
                }
              }
            ])
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
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  )
}
