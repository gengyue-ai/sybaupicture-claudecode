import { Metadata } from 'next'
import ZHHelpPageClient from './ZHHelpPageClient'

export const metadata: Metadata = {
  title: '帮助支持 - Sybau Picture | AI图片生成器常见问题',
  description: '找到关于Sybau Picture AI图片生成器的常见问题答案。获取图片生成、价格、故障排除等方面的帮助。',
  keywords: ['帮助', '支持', '常见问题', 'AI图片生成器', 'Sybau Picture', '故障排除', '指南', '教程'],
  openGraph: {
    title: '帮助支持 - Sybau Picture',
    description: '找到关于Sybau Picture AI图片生成器的常见问题答案。获取图片生成、价格、故障排除等方面的帮助。',
    url: 'https://sybaupicture.com/zh/help',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '帮助支持 - Sybau Picture',
    description: '找到关于Sybau Picture AI图片生成器的常见问题答案。',
  },
  alternates: {
    canonical: '/zh/help',
    languages: {
      'en-US': '/help',
      'zh-CN': '/zh/help',
    },
  },
}

export default function ZHHelpPage() {
  return (
    <>
      {/* 中文FAQ结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "inLanguage": "zh-CN",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "如何开始使用Sybau Picture？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "1. 访问我们的生成器 2. 上传图片或输入文字描述 3. 选择Sybau风格 4. 点击生成按钮，等待8秒即可获得您的专属创意作品！体验Stay Young, Beautiful and Unique的文化理念。"
                }
              },
              {
                "@type": "Question",
                "name": "支持哪些图片格式？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "我们支持 JPG、PNG、WebP 格式的图片。建议图片尺寸不超过10MB，分辨率在500x500到2000x2000像素之间效果最佳。"
                }
              },
              {
                "@type": "Question",
                "name": "免费用户有什么限制？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "免费用户享有基础体验配额。标准版用户每月可生成60张，专业版用户每月可生成180张图片，享受优先处理队列。"
                }
              },
              {
                "@type": "Question",
                "name": "可以商业使用生成的图片吗？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "是的！您拥有生成图片的完整使用权，可以用于个人和商业目的。但请确保上传的原始图片没有版权问题。"
                }
              }
            ]
          })
        }}
      />
      <ZHHelpPageClient />
    </>
  )
}
