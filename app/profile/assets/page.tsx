import type { Metadata } from 'next'
import AssetsPageClient from './AssetsPageClient'

export const metadata: Metadata = {
  title: 'My Assets - Sybau Picture',
  description: 'Manage and view all your generated AI images. Track statistics, download history, and organize your creative assets.',
  alternates: {
    canonical: '/profile/assets',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AssetsPage() {
  return <AssetsPageClient />
}