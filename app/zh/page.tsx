import { Metadata } from 'next'
import HomePageClient from '@/components/HomePageClient'

export const metadata: Metadata = {
  title: 'Sybau Picture | 创建病毒式创意内容 - Stay Young, Beautiful and Unique',
  description: '使用AI将文本或图片转换为令人惊艳的创意视觉作品。体验Z时代Sybau文化 - Stay Young, Beautiful and Unique！',
  alternates: {
    canonical: '/zh',
    languages: {
      'en': '/',
      'zh': '/zh',
    },
  },
  openGraph: {
    title: 'Sybau Picture | 创建病毒式创意内容',
    description: '使用AI将文本或图片转换为令人惊艳的创意视觉作品。体验Sybau文化 - Stay Young, Beautiful and Unique！',
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
            "name": "Sybau图片生成器",
            "description": "AI驱动的工具，将任何照片转换为病毒式Sybau风格表情包",
            "url": "https://sybaupicture.com/zh",
            "inLanguage": "zh-CN",
            "applicationCategory": "PhotoEditingApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY"
            },
            "creator": {
              "@type": "Organization",
              "name": "Sybau Picture"
            }
          })
        }}
      />

      <HomePageClient />
    </>
  )
}
