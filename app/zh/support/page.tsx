'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HelpCircle, Search, Mail } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ZHSupportPage() {
  const faqs = [
    {
      question: '如何生成我的第一张图片？',
      answer: '只需转到生成器页面，上传您的图片，描述您想要的效果，然后点击生成！'
    },
    {
      question: '为什么我的图片生成需要这么长时间？',
      answer: '生成通常需要10-30秒。高峰期可能会导致延迟。请稍后再试。'
    },
    {
      question: '我可以将生成的图片用于商业目的吗？',
      answer: '是的！通过Sybau Picture生成的所有图片都可以用于商业目的。'
    },
    {
      question: '我每月可以生成多少张图片？',
      answer: '免费用户享有基础体验配额。标准版用户每月60张，专业版用户每月180张。'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">技术支持</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            在使用Sybau Picture时遇到问题？查找常见问题的答案或联系我们的支持团队。
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="text-center transition-shadow">
              <CardContent className="p-6">
                <Search className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">搜索FAQ</h3>
                <p className="text-gray-600 mb-4">快速找到常见问题的答案</p>
                <Link href="/zh/help">
                  <Button variant="outline" className="w-full">浏览FAQ</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="text-center transition-shadow">
              <CardContent className="p-6">
                <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">邮件支持</h3>
                <p className="text-gray-600 mb-4">给我们发送详细信息</p>
                <Link href="/zh/contact">
                  <Button variant="outline" className="w-full">发送邮件</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="w-6 h-6 mr-2 text-orange-600" />
                常见问题解答
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
