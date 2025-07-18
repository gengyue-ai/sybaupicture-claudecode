import { Metadata } from 'next'
import GalleryClient from '@/components/GalleryClient'

export const metadata: Metadata = {
  title: 'Sybau创意画廊 - 探索AI生成艺术作品 | Sybau Picture',
  description: '探索数千个令人惊叹的Sybau风格AI生成作品。发现由全球创作者使用先进AI技术创建的独特艺术作品，体验Stay Young, Beautiful and Unique的创意精神。',
  keywords: ['Sybau画廊', 'AI艺术', '人工智能生成', '创意作品', 'Sybau风格', 'AI画廊', '数字艺术'],
  openGraph: {
    title: 'Sybau创意画廊 - 探索AI生成艺术作品',
    description: '探索数千个令人惊叹的Sybau风格AI生成作品。发现独特的AI艺术创作。',
    url: 'https://sybaupicture.com/zh/gallery',
    images: [
      {
        url: '/logo-600x600.svg',
        width: 600,
        height: 600,
        alt: 'Sybau Picture 创意画廊',
      },
    ],
  },
  alternates: {
    canonical: '/zh/gallery',
    languages: {
      'en-US': '/gallery',
      'zh-CN': '/zh/gallery',
    },
  },
}

export default function ZHGalleryPage() {
  return <GalleryClient />
}
