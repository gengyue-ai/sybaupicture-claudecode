import { Metadata } from 'next'
import GalleryClient from '@/components/GalleryClient'

export const metadata: Metadata = {
  title: 'FLUX Engine Application Gallery - 9 Professional AI Image Editing Scenarios | Sybau Picture',
  description: 'Explore 9 professional AI image editing scenarios powered by FLUX Pro engine. From smart watermark removal to style conversion - 12 billion parameters, 15-second generation.',
  keywords: [
    'FLUX engine', 'AI image editing', 'watermark removal', 'background replacement', 'style conversion', 
    'body optimization', 'professional AI editing', 'FLUX Pro', 'Kontext AI', '12 billion parameters',
    'AI photo editing', 'smart image processing', 'before after gallery', 'AI editing examples'
  ],
  openGraph: {
    title: 'FLUX Engine Application Gallery - Professional AI Image Editing',
    description: 'Discover 9 professional AI image editing scenarios. FLUX Pro engine with 12 billion parameters, 15-second generation time.',
    images: ['/og-gallery-flux.webp'],
    url: 'https://sybaupicture.com/gallery',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLUX Engine Application Gallery - Professional AI Image Editing',
    description: 'Explore 9 AI image editing scenarios: watermark removal, style conversion, background replacement and more.',
    images: ['/og-gallery-flux.webp'],
  },
  alternates: {
    canonical: 'https://sybaupicture.com/gallery',
    languages: {
      'en': 'https://sybaupicture.com/gallery',
      'zh': 'https://sybaupicture.com/zh/gallery',
    },
  },
}

export default function GalleryPage() {
  return <GalleryClient />
}