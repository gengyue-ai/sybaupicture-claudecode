'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Mail, MessageSquare } from 'lucide-react'

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

              <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">邮箱支持</h4>
                  <p className="text-gray-600 text-sm mb-2">获取技术问题帮助</p>
                  <a href="mailto:support@sybaupicture.com" className="text-blue-600 hover:text-blue-800">
                    support@sybaupicture.com
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">一般咨询</h4>
                  <p className="text-gray-600 text-sm mb-2">关于我们平台的问题</p>
                  <a href="mailto:hello@sybaupicture.com" className="text-green-600 hover:text-green-800">
                    hello@sybaupicture.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
