import { Metadata } from 'next'
import PricingPageClient from './PricingPageClient'

export const metadata: Metadata = {
  title: '价格套餐 - Sybau Picture | AI图片生成器订阅方案',
  description: '选择适合您的Sybau Picture AI图片生成器套餐。免费体验、标准版60张/月、专业版180张/月。FLUX Pro引擎，专业级AI图像编辑。',
  keywords: ['价格', '套餐', '订阅', 'AI图片生成器', 'Sybau Picture', 'FLUX Pro', '专业版', '标准版'],
  openGraph: {
    title: '价格套餐 - Sybau Picture',
    description: '选择适合您的AI图片生成器套餐。FLUX Pro引擎，专业级图像编辑。',
    url: 'https://sybaupicture.com/zh/pricing',
    locale: 'zh_CN',
  },
  alternates: {
    canonical: 'https://sybaupicture.com/pricing', // 指向英文主版本
    languages: {
      'en-US': 'https://sybaupicture.com/pricing',
      'zh-CN': 'https://sybaupicture.com/zh/pricing',
      'x-default': 'https://sybaupicture.com/pricing'
    },
  },
  robots: {
    index: false, // 避免重复索引，让英文版作为主版本
    follow: true,
  },
}

export default function ZHPricingPage() {
  return <PricingPageClient />
}