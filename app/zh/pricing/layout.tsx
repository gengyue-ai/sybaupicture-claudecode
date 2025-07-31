import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sybau FLUX Pro AI定价方案 - 专业图像生成套餐',
  description: '选择适合您的AI图像生成套餐。免费版、标准版（每月￥63）、专业版（每月￥133）。FLUX Pro引擎，商业级品质，15秒生成，满足不同创作需求。',
  keywords: ['Sybau定价', 'FLUX Pro套餐', 'AI图像生成价格', '专业AI编辑订阅', 'AI图片编辑器价格'],
  openGraph: {
    title: 'Sybau FLUX Pro AI定价方案 - 专业图像生成套餐',
    description: '选择适合您的AI图像生成套餐。免费版、标准版、专业版，FLUX Pro引擎驱动，满足不同创作需求。',
    url: 'https://sybaupicture.com/zh/pricing',
    locale: 'zh_CN',
  },
  alternates: {
    canonical: '/zh/pricing',
    languages: {
      'en-US': '/pricing',
      'zh-CN': '/zh/pricing',
    },
  },
}

export default function ZHPricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}