import { Metadata } from 'next'
import GalleryClient from '@/components/GalleryClient'

export const metadata: Metadata = {
  title: 'AI Gallery - Sybau Picture Creations | Discover Amazing AI Art',
  description: 'Explore stunning AI-generated Sybau pictures created by our community. Get inspired by creative transformations and discover trending AI art styles.',
  keywords: ['AI gallery', 'Sybau pictures', 'AI art', 'creative gallery', 'AI generated images', 'digital art'],
  openGraph: {
    title: 'AI Gallery - Sybau Picture Creations',
    description: 'Explore stunning AI-generated Sybau pictures created by our community. Get inspired by creative transformations.',
    images: ['/og-gallery.webp'],
    url: 'https://sybaupicture.com/gallery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Gallery - Sybau Picture Creations',
    description: 'Explore stunning AI-generated Sybau pictures created by our community.',
    images: ['/og-gallery.webp'],
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