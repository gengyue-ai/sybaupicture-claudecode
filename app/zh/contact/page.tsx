import { Card, CardContent } from '@/components/ui/card'
import { Mail, MessageSquare } from 'lucide-react'
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
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="font-semibold mb-4">感谢您对Sybau Picture的关注</h3>
                <p className="text-gray-600">我们非常感谢您对我们AI驱动图像生成平台的反馈和咨询。</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">联系表单</h4>
                <p className="text-gray-600 mb-4">发送消息给我们，我们将在24小时内回复您</p>
                
                <form className="max-w-md mx-auto space-y-4">
                  <div>
                    <input 
                      type="email" 
                      placeholder="您的邮箱地址" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required 
                    />
                  </div>
                  <div>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">选择咨询类型</option>
                      <option value="technical">技术支持</option>
                      <option value="general">一般问题</option>
                      <option value="billing">计费和订阅</option>
                      <option value="feature">功能建议</option>
                    </select>
                  </div>
                  <div>
                    <textarea 
                      placeholder="您的消息" 
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    发送消息
                  </button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
