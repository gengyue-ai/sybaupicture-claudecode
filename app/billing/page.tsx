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
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  ArrowRight,
  Crown,
  Grid,
  Star,
  Check,
  TrendingUp,
  Loader2
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

  // 重定向未登录用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
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
      const subResponse = await fetch('/api/subscription')
      if (subResponse.ok) {
        const subData = await subResponse.json()
        console.log('💎 订阅数据:', subData)
        if (subData.user && subData.user.plan) {
          setSubscription({
            planName: subData.user.plan.name || 'free',
            status: subData.subscription?.status || 'active',
            currentPeriodEnd: subData.subscription?.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: subData.subscription?.cancelAtPeriodEnd || false,
            priceId: subData.subscription?.stripePriceId || '',
            amount: subData.user.plan?.price * 100 || 0, // 转换为分
            currency: 'usd',
            interval: subData.subscription?.billingCycle || 'monthly'
          })
        } else {
          // 处理免费用户情况
          setSubscription({
            planName: 'free',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            priceId: '',
            amount: 0,
            currency: 'usd',
            interval: 'monthly'
          })
        }
      }

      // 获取使用情况
      const usageResponse = await fetch('/api/user/usage')
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        console.log('📊 用量数据:', usageData)
        // 修复：适配新的API格式 {success: true, data: {...}}
        if (usageData.success && usageData.data) {
          setUsage({
            currentUsage: usageData.data.currentUsage,
            limit: usageData.data.limit,
            resetDate: usageData.data.resetDate
          })
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'past_due':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Past Due</Badge>
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Canceled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlanBadge = (planName: string) => {
    const badges = {
      free: { label: 'Free', variant: 'secondary' as const },
      standard: { label: 'Standard', variant: 'default' as const },
      premium: { label: 'Premium', variant: 'destructive' as const }
    }
    return badges[planName as keyof typeof badges] || badges.free
  }

  const getPlanQuota = (planName: string) => {
    const quotas = {
      free: 3,
      standard: 60,
      premium: 180,
      pro: 180
    }
    return quotas[planName as keyof typeof quotas] || 3
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
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your billing information.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription and billing information</p>
      </div>

      <div className="grid gap-6">
        {/* 当前方案 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge {...getPlanBadge(subscription.planName)}>
                      {getPlanBadge(subscription.planName).label} Plan
                    </Badge>
                    <div className="mt-2">
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {getPlanQuota(subscription.planName)} images per month
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${(subscription.amount / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      per {subscription.interval}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Next billing date</p>
                      <p className="text-lg">{formatDate(subscription.currentPeriodEnd)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Auto-renewal</p>
                      <p className="text-lg">
                        {subscription.cancelAtPeriodEnd ? 'Disabled' : 'Enabled'}
                      </p>
                    </div>
                  </div>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-800">
                      Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                      You'll continue to have access until then.
                    </p>
                  </div>
                )}
                
                {/* 付费用户的操作按钮 */}
                <div className="border-t pt-4">
                  <div className="flex justify-center gap-3">
                    {/* 只有当前不是最高级别方案时才显示升级按钮 */}
                    {subscription.planName !== 'pro' && (
                      <Link href="/pricing">
                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Upgrade Plan
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Badge variant="secondary" className="mb-4">Free Plan</Badge>
                <p className="text-gray-600 mb-2">You're currently on the free plan with basic features.</p>
                <p className="text-sm text-gray-500 mb-4">3 images per month included</p>
                <div className="flex justify-center gap-3">
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Upgrade Plan
                    </Button>
                  </Link>
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
              Start Creating
            </CardTitle>
            <CardDescription>
              Jump right into creating amazing AI images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              {usage && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Images Generated This Month</span>
                    <span className="text-sm text-gray-600">
                      {usage.currentUsage} / {usage.limit === -1 ? '∞' : usage.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ 
                        width: usage.limit === -1 ? '0%' : `${Math.min((usage.currentUsage / usage.limit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {usage.limit !== -1 ? `${usage.limit - usage.currentUsage} remaining` : 'Unlimited'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Resets {formatDate(usage.resetDate)}
                    </span>
                  </div>
                  {usage.limit !== -1 && usage.currentUsage >= usage.limit && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-orange-800">
                        <strong>Monthly limit reached!</strong> Upgrade to create more images or wait until next month.
                      </p>
                    </div>
                  )}
                  {usage.limit !== -1 && usage.currentUsage >= usage.limit * 0.8 && usage.currentUsage < usage.limit && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Almost at limit!</strong> You have {usage.limit - usage.currentUsage} images left this month.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <Link href="/">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Zap className="mr-2 h-5 w-5" />
                  Create Images Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}