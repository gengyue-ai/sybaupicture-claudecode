import { Metadata } from 'next'
import GalleryClient from '@/components/GalleryClient'

// 二级域名独立页面 - 用于广告反向代理
export const metadata: Metadata = {
  title: 'Gallery - AI Image Editing Examples',
  description: 'Explore professional AI image editing scenarios powered by FLUX Pro engine. Watermark removal, style conversion, background replacement and more.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function GallerySubdomainPage() {
  return <GalleryClient />
}
