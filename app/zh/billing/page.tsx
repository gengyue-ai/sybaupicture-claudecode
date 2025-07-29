'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Calendar, 
  FileText, 
  Settings,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Zap,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface SubscriptionData {
  planName: string
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  priceId: string
  amount: number
  currency: string
  interval: string
}

interface UsageData {
  currentUsage: number
  limit: number
  resetDate: string
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [managingBilling, setManagingBilling] = useState(false)

  // 重定向未登录用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/zh/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBillingData()
    }
  }, [status])

  const fetchBillingData = async () => {
    try {
      setLoading(true)

      // 获取订阅信息
      const subResponse = await fetch('/api/user/subscription')
      if (subResponse.ok) {
        const subData = await subResponse.json()
        if (subData.success) {
          setSubscription(subData.data)
        }
      }

      // 获取使用情况
      const usageResponse = await fetch('/api/user/usage')
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        if (usageData.success) {
          setUsage(usageData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      setManagingBilling(true)
      const response = await fetch('/api/payment/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        console.error('Failed to create portal session')
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setManagingBilling(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />有效</Badge>
      case 'past_due':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />逾期</Badge>
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />已取消</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlanBadge = (planName: string) => {
    const badges = {
      free: { label: '免费', variant: 'secondary' as const },
      standard: { label: '标准', variant: 'default' as const },
      premium: { label: '高级', variant: 'destructive' as const }
    }
    return badges[planName as keyof typeof badges] || badges.free
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">访问被拒绝</h1>
          <p className="text-gray-600 mb-4">请登录以查看您的账单信息。</p>
          <Link href="/zh/auth/signin">
            <Button>登录</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">账单与订阅</h1>
        <p className="text-gray-600">管理您的订阅和账单信息</p>
      </div>

      <div className="grid gap-6">
        {/* 当前方案 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              当前方案
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge {...getPlanBadge(subscription.planName)}>
                      {getPlanBadge(subscription.planName).label}套餐
                    </Badge>
                    <div className="mt-2">
                      {getStatusBadge(subscription.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${(subscription.amount / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      每{subscription.interval === 'month' ? '月' : '年'}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">下次账单日期</p>
                      <p className="text-lg">{formatDate(subscription.currentPeriodEnd)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">自动续费</p>
                      <p className="text-lg">
                        {subscription.cancelAtPeriodEnd ? '已关闭' : '已开启'}
                      </p>
                    </div>
                  </div>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-800">
                      您的订阅将在 {formatDate(subscription.currentPeriodEnd)} 结束。
                      在此之前您仍可继续使用服务。
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Badge variant="secondary" className="mb-4">免费套餐</Badge>
                <p className="text-gray-600 mb-4">您目前使用的是免费套餐，享有基础功能。</p>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={handleManageBilling}
                    disabled={managingBilling}
                    variant="outline"
                  >
                    {managingBilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                    管理账单
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        {/* 立即创作 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              立即创作
            </CardTitle>
            <CardDescription>
              马上开始创作精美的AI图片
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              {usage && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">本月已生成图片</span>
                    <span className="text-sm text-gray-600">
                      {usage.currentUsage} / {usage.limit === -1 ? '∞' : usage.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: usage.limit === -1 ? '0%' : `${Math.min((usage.currentUsage / usage.limit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  {usage.limit !== -1 && usage.currentUsage >= usage.limit && (
                    <p className="text-sm text-orange-600 mt-2">
                      您已达到本月使用限额。升级套餐以生成更多图片。
                    </p>
                  )}
                </div>
              )}
              
              <Link href="/zh">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Zap className="mr-2 h-5 w-5" />
                  立即生成图片
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}