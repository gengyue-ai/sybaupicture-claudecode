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
  ArrowRight,
  Crown,
  Grid,
  Star,
  Check,
  TrendingUp
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
        console.log('📊 用量数据:', usageData)
        // 修复：直接使用API返回的数据结构
        if (usageData.usageCount !== undefined) {
          setUsage({
            currentUsage: usageData.usageCount,
            limit: usageData.maxUsage,
            resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
          })
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
      console.log('🏗️ 创建客户门户会话...')
      
      const response = await fetch('/api/payment/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📊 门户会话API响应状态:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ 门户会话创建成功:', result)
        
        if (result.url) {
          console.log('🔄 重定向到Stripe客户门户...')
          window.location.href = result.url
        } else {
          console.error('❌ 响应中缺少门户URL')
          alert('创建账单管理会话失败 - 缺少重定向URL')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: '未知错误' }))
        console.error('❌ 创建门户会话失败:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        
        let errorMessage = '创建账单管理会话失败'
        
        switch (response.status) {
          case 401:
            errorMessage = '请先登录后再尝试管理账单'
            break
          case 404:
            errorMessage = '未找到用户信息或Stripe客户记录'
            break
          case 500:
            errorMessage = '服务器配置错误，请联系技术支持'
            break
          default:
            errorMessage = `账单管理服务暂时不可用 (错误代码: ${response.status})`
        }
        
        alert(errorMessage)
      }
    } catch (error) {
      console.error('❌ 请求门户会话时发生错误:', error)
      alert('网络错误：无法连接到账单管理服务，请稍后重试')
    } finally {
      setManagingBilling(false)
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
                    <Button 
                      onClick={handleManageBilling}
                      disabled={managingBilling}
                      variant="outline"
                    >
                      {managingBilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                      Manage Billing
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Badge variant="secondary" className="mb-4">Free Plan</Badge>
                <p className="text-gray-600 mb-4">You're currently on the free plan with basic features.</p>
                <div className="flex justify-center gap-3">
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Upgrade Plan
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleManageBilling}
                    disabled={managingBilling}
                    variant="outline"
                  >
                    {managingBilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                    Manage Billing
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
                      You've reached your monthly limit. Upgrade to create more images.
                    </p>
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