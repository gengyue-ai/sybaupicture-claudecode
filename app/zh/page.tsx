import { Metadata } from 'next'
import HomePageClient from '@/components/HomePageClient'

export const metadata: Metadata = {
  title: 'Sybau FLUX Pro图像生成器 | Kontext AI图片编辑器 - 专业AI图像生成',
  description: 'Sybau基于FLUX Pro/Kontext AI的专业图像生成器。120亿参数模型，9大应用场景，15秒生成，轻松实现专业级AI图片编辑。',
  keywords: ['Sybau', '图像生成器', 'FLUX Pro', 'Kontext AI', 'AI图片编辑', 'flux-pro/kontext', '专业AI编辑', 'AI图像生成', 'sybau图像生成器'],
  alternates: {
    canonical: '/zh',
    languages: {
      'en': '/',
      'zh': '/zh',
    },
  },
  openGraph: {
    title: 'Sybau FLUX Pro图像生成器 | Kontext AI专业编辑',
    description: 'Sybau基于FLUX Pro/Kontext AI的专业图像生成器。120亿参数模型，9大应用场景，15秒生成专业图片。',
    images: ['/og-image.webp'],
    locale: 'zh_CN',
  },
}

export default function ChineseHomePage() {
  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Sybau FLUX Pro图像生成器",
            "description": "基于FLUX Pro/Kontext AI的专业图像生成器，120亿参数模型，支持9大应用场景，15秒专业级AI图片编辑",
            "url": "https://sybaupicture.com/zh",
            "inLanguage": "zh-CN",
            "applicationCategory": "PhotoEditingApplication",
            "operatingSystem": "Web Browser",
            "keywords": "Sybau, 图像生成器, FLUX Pro, Kontext AI, AI图片编辑, flux-pro/kontext",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY"
            },
            "creator": {
              "@type": "Organization",
              "name": "Sybau Picture"
            },
            "featureList": [
              "FLUX Pro/Kontext AI引擎",
              "120亿参数模型",
              "9大应用场景",
              "15秒快速生成",
              "专业级图像编辑"
            ]
          })
        }}
      />

      <HomePageClient />
    </>
  )
}
