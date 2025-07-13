'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Star, Sparkles, Zap, Crown, Shield, Users, Rocket } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const getPricingPlans = (isAnnual: boolean) => [
  {
    id: 'free',
    name: '免费版',
    price: '$0',
    originalPrice: null,
    yearlyPrice: null,
    period: '永久',
    description: '完美的Sybau AI体验入门',
    badge: null,
    features: [
      '免费创作体验',
      '基础Sybau风格',
      '标准质量 (1024x1024)',
      '社区画廊访问'
    ],
    limitations: [
      '基础使用配额',
      '带水印图片'
    ],
    buttonText: '免费开始',
    buttonVariant: 'outline' as const,
    popular: false,
    icon: Star
  },
  {
    id: 'standard',
    name: '标准版',
    price: isAnnual ? '$6' : '$9',
    originalPrice: isAnnual ? '$9' : null,
    yearlyPrice: isAnnual ? '每年 $72' : null,
    period: isAnnual ? '每月' : '每月',
    description: '适合日常创作者',
    badge: null,
    features: [
      '每月60张图片',
      '所有Sybau风格',
      '高质量 (最高2048x2048)',
      '无水印',
      '多种格式下载'
    ],
    limitations: [
      '每月使用限制'
    ],
    buttonText: '选择标准版',
    buttonVariant: 'default' as const,
    popular: false,
    icon: Zap
  },
  {
    id: 'pro',
    name: '专业版',
    price: isAnnual ? '$12' : '$19',
    originalPrice: isAnnual ? '$19' : null,
    yearlyPrice: isAnnual ? '每年 $144' : null,
    period: isAnnual ? '每月' : '每月',
    description: '专业创作者的选择',
    badge: '最受欢迎',
    features: [
      '每月180张图片',
      '所有高级Sybau风格',
      '超高质量 (最高4096x4096)',
      '无水印',
      '优先处理',
      '高级AI功能'
    ],
    limitations: [],
    buttonText: '升级专业版',
    buttonVariant: 'default' as const,
    popular: true,
    icon: Crown
  }
]

const faqs = [
  {
    question: '图片限制如何工作？',
    answer: '每个套餐包含特定数量的图片生成额度。免费用户享有基础体验配额，标准版用户每月60张，专业版用户每月180张。'
  },
  {
    question: '可以随时升级或降级套餐吗？',
    answer: '可以，您可以随时更改套餐。升级立即生效，降级将在下一个计费周期生效。'
  },
  {
    question: '如果超过图片限制会怎样？',
    answer: '如果达到每月限制，您可以升级套餐来继续创作精彩内容。免费用户可以升级以解锁更多功能和更高配额。'
  },
  {
    question: '有隐藏费用吗？',
    answer: '没有，我们的定价完全透明。您看到的价格就是您需要支付的，没有任何隐藏费用或收费。'
  },
  {
    question: '可以随时取消订阅吗？',
    answer: '可以，您可以随时取消订阅。您将继续享有套餐功能直到当前计费周期结束。'
  }
]

export default function ZHPricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const pricingPlans = getPricingPlans(isAnnual)
  const router = useRouter()

  const handlePlanClick = (planId: string) => {
    if (planId === 'free') {
      // 免费版直接跳转到中文主页使用生成器
      router.push('/zh')
    } else {
      // 付费版跳转到中文登录页面
      router.push('/zh/auth/signin?callbackUrl=/zh/pricing')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            简单透明的定价
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            解锁Sybau AI的全部潜力
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            选择适合您创意需求的套餐。使用我们的AI驱动平台生成令人惊叹的Sybau图像。
          </p>

          {/* Billing Toggle - Fixed overlap issue */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-lg border relative">
              <div className="flex items-center relative">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    !isAnnual
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  按月付费
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    isAnnual
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  按年付费
                </button>
              </div>
              {/* Move the badge outside the button */}
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-green-500 text-white text-xs px-2 py-1 shadow-lg">
                  节省高达37%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon
            return (
              <Card key={plan.id} className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg scale-105' : ''}`}>
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-sm font-medium">
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-600">/{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-500 line-through mb-2">
                      {plan.originalPrice}/{plan.period}
                    </div>
                  )}
                  {plan.yearlyPrice && isAnnual && (
                    <div className="text-sm text-gray-600 mb-2">
                      {plan.yearlyPrice}
                    </div>
                  )}
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <Button
                    className={`w-full mb-6 ${plan.popular ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}`}
                    variant={plan.buttonVariant}
                    size="lg"
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    {plan.buttonText}
                  </Button>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">包含功能：</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-500 mb-2">限制：</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, idx) => (
                            <li key={idx} className="flex items-start">
                              <X className="w-4 h-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">套餐功能对比</h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">功能</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">免费版</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">标准版</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">专业版</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">每月图片数</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">体验配额</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">60张</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">180张</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">最大分辨率</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">1024x1024</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">2048x2048</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">4096x4096</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">去除水印</td>
                    <td className="px-6 py-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">所有Sybau风格</td>
                    <td className="px-6 py-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">优先处理</td>
                    <td className="px-6 py-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">常见问题</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">准备开始创作了吗？</h2>
          <p className="text-xl mb-6 opacity-90">
            加入数千位使用Sybau AI实现创意的创作者。
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100" onClick={() => router.push('/zh')}>
            立即开始
          </Button>
        </div>
      </div>
    </div>
  )
}
