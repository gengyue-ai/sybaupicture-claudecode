import { Metadata } from 'next'
import GalleryClient from '@/components/GalleryClient'

export const metadata: Metadata = {
  title: 'FLUX引擎应用案例库 - 9大专业AI图像编辑场景 | Sybau Picture',
  description: '探索基于FLUX Pro引擎的9大专业AI图像编辑场景。从智能去水印到风格转换，120亿参数模型，15秒生成专业级作品。',
  keywords: [
    'FLUX引擎', 'AI图像编辑', '智能去水印', '背景替换', '风格转换', 
    '身材优化', '专业AI编辑', 'FLUX Pro', 'Kontext AI', '120亿参数',
    'AI照片编辑', '智能图像处理', '前后对比', 'AI编辑案例'
  ],
  openGraph: {
    title: 'FLUX引擎应用案例库 - 专业AI图像编辑',
    description: '发现9大专业AI图像编辑场景。FLUX Pro引擎，120亿参数，15秒生成时间。',
    url: 'https://sybaupicture.com/zh/gallery',
    images: ['/og-gallery-flux.webp'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLUX引擎应用案例库 - 专业AI图像编辑',
    description: '探索9大AI图像编辑场景：智能去水印、风格转换、背景替换等。',
    images: ['/og-gallery-flux.webp'],
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
