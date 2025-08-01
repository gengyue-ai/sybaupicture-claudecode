import ContactForm from '@/components/ContactForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '联系我们 - Sybau Picture | AI图片生成器客服',
  description: '联系Sybau Picture团队获取AI图片生成器的支持、反馈或咨询。发送消息，我们会在24小时内回复您。',
  keywords: ['联系我们', '客服', '技术支持', 'AI图片生成器', 'Sybau Picture', '帮助', '反馈'],
  openGraph: {
    title: '联系我们 - Sybau Picture',
    description: '联系Sybau Picture团队获取AI图片生成器的支持和咨询。',
    url: 'https://sybaupicture.com/zh/contact',
    locale: 'zh_CN',
  },
  alternates: {
    canonical: '/zh/contact',
    languages: {
      'en-US': '/contact',
      'zh-CN': '/zh/contact',
    },
  },
}

export default function ZHContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">联系我们</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            有任何问题或建议？我们的团队随时为您提供帮助。
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-semibold mb-4">感谢您对Sybau Picture的关注</h3>
            <p className="text-gray-600">我们非常感谢您对我们AI驱动图像生成平台的反馈和咨询。</p>
          </div>
          
          <ContactForm locale="zh" />
        </div>
      </div>
    </div>
  )
}
