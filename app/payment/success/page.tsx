'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, ArrowRight, Star, Zap } from 'lucide-react'

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      // 这里可以添加验证支付状态的逻辑
      setTimeout(() => setLoading(false), 2000)
    } else {
      setError('支付会话ID缺失')
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">正在确认您的付款...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">支付验证失败</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full"
            >
              返回定价页面
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <Card className="max-w-2xl w-full mx-4">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            🎉 支付成功！
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            欢迎加入Sybau Picture高级会员！您的订阅已激活。
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 功能亮点 */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2" />
              您现在可以享受：
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                无限制生成高质量AI图片
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                更高分辨率输出（最高4K）
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                专业Sybau Lazer Dim 700风格
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                优先处理队列
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                无水印下载
              </li>
            </ul>
          </div>

          {/* 后续操作 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-purple-600" />
              开始您的创作之旅
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push('/')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                立即生成图片
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Button
                onClick={() => router.push('/gallery')}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                浏览作品画廊
              </Button>
            </div>
          </div>

          {/* 支持信息 */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              需要帮助？我们随时为您服务
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => router.push('/help')}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
              >
                访问帮助中心
              </Button>
              <Button
                onClick={() => router.push('/contact')}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
              >
                联系客服
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
