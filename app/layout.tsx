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
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ResourcePreloader } from '@/components/performance/ResourcePreloader'
import { CriticalCSS } from '@/components/performance/CriticalCSS'
import { AsyncCSS } from '@/components/performance/AsyncCSS'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sybau FLUX Pro AI Picture Generator',
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
    canonical: 'https://sybaupicture.com/', // 绝对URL
    languages: {
      'en-US': 'https://sybaupicture.com/',
      'zh-CN': 'https://sybaupicture.com/zh',
      'x-default': 'https://sybaupicture.com/'
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
        {/* 关键CSS内联 - 首屏渲染优化 */}
        <CriticalCSS />
        
        {/* DNS预解析和预连接 - 优化顺序 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fal.media" />
        
        {/* LCP关键图片预加载 - 只预加载before图片避免竞争 */}
        <link rel="preload" as="image" href="/images/hero-showcase/hero-removal-before.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/logo.svg" fetchPriority="high" />
        
        {/* 预加载关键字体 */}
        <link rel="preload" href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Google Analytics - 异步延迟加载避免阻塞渲染 */}
        
        {/* Favicon - 强制使用SVG，避免ICO缓存问题 */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-icon.svg" />
        <meta name="msapplication-config" content="none" />
        
        {/* 视口优化 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
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
        <Providers>
          <AuthStateHandler />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <SonnerToaster />
          
          {/* 延迟加载的非关键组件 */}
          <BackgroundUserSync />
          <GoogleAnalytics />
        </Providers>
        
        {/* 延迟加载的分析脚本 */}
        <Analytics />
        <SpeedInsights />
        
        {/* 安全的性能优化组件 */}
        <AsyncCSS />
        
        {/* Google AdSense - 懒加载避免阻塞首屏渲染 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1000714999006921"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
