import type { Metadata } from 'next'
import AssetsPageClient from './AssetsPageClient'

export const metadata: Metadata = {
  title: 'My Assets - Sybau Picture',
  description: 'Manage and view all your generated AI images. Track statistics, download history, and organize your creative assets.',
  robots: {
    index: false, // 私人页面，需要登录，不应该被搜索引擎索引
    follow: false,
  },
}

export default function AssetsPage() {
  return <AssetsPageClient />
}