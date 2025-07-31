import { Metadata } from 'next'
import HomePageClient from '@/components/HomePageClient'

export const metadata: Metadata = {
  title: 'FLUX Pro Picture Generator - Sybau AI Editor',
  description: 'Professional AI picture generator powered by FLUX Pro engine. 9 specialized templates, 15s generation, commercial quality. Create stunning images with watermark removal and style conversion.',
  keywords: ['FLUX Pro', 'AI picture generator', 'Kontext AI', 'Sybau Picture', 'AI image editor', 'flux-pro/kontext', 'professional AI editing', 'watermark removal', 'body optimization', 'style conversion', 'background replacement'],
  openGraph: {
    title: 'Sybau Picture - FLUX Pro AI Picture Generator',
    description: 'Professional AI picture generator with FLUX Pro engine. 9 specialized templates, 15s generation, commercial quality results.',
    url: 'https://sybaupicture.com',
    type: 'website',
    images: [{
      url: 'https://sybaupicture.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Sybau Picture - AI Picture Generator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sybau Picture - FLUX Pro Picture Generator',
    description: 'Professional AI picture generator with FLUX Pro engine. 9 specialized templates, commercial quality.',
    images: ['https://sybaupicture.com/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'zh-CN': '/zh',
    },
  },
}

export default function HomePage() {
  return <HomePageClient />
}
