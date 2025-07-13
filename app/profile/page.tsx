'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { User, Calendar, CreditCard, Image, Settings, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserProfile } from '@/hooks/useUserProfile'

interface UserProfile {
  name: string
  email: string
  image: string
  plan: {
    name: string
    hasWatermark: boolean
  }
  usage: {
    current: number
    max: number
    remaining: number
  }
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { profile: userProfile, syncState, refreshData } = useUserProfile()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 🚨 修复：只有在明确未认证时才重定向，避免loading状态误判
    if (status === 'unauthenticated') {
      console.log('⚠️ 用户未认证，重定向到登录页面')
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      console.log('✅ 用户已认证，立即同步最新数据')
      
      // 🔑 关键：用户进入profile页面时立即刷新数据
      if (!syncState.isSyncing) {
        refreshData()
      }
      
      if (userProfile) {
        console.log('✅ 使用统一数据管理系统的数据')
        
        // 使用统一数据管理系统的数据
        setProfile({
          name: userProfile.name,
          email: userProfile.email,
          image: userProfile.image || '',
          plan: {
            name: userProfile.subscriptionPlan,
            hasWatermark: userProfile.planFeatures.hasWatermark
          },
          usage: {
            current: userProfile.usageCount,
            max: userProfile.maxUsage,
            remaining: Math.max(0, userProfile.maxUsage - userProfile.usageCount)
          },
          createdAt: new Date().toISOString()
        })
        setLoading(false)
      }
    }
    
    // loading状态不做任何操作，等待认证完成
    if (status === 'loading') {
      console.log('🔄 正在检查用户认证状态...')
    }
  }, [status, router, userProfile, refreshData, syncState.isSyncing])

  // 当页面重新获得焦点时自动同步最新数据（用户从其他页面返回时）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && status === 'authenticated' && !syncState.isLoading) {
        console.log('🔄 页面变为可见，自动同步Profile数据')
        refreshData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [status, syncState.isLoading, refreshData])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Unable to load profile</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const usagePercentage = (profile.usage.current / profile.usage.max) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your account information and subscription status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：个人信息 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 头像和基本信息 */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  {profile.image ? (
                    <img
                      src={`${profile.image}?t=${Date.now()}`}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover border-4 border-purple-200"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{profile.name}</h2>
                <p className="text-gray-600 flex items-center justify-center mt-2">
                  <Mail className="w-4 h-4 mr-2" />
                  {profile.email}
                </p>
                <p className="text-sm text-gray-500 flex items-center justify-center mt-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined: {new Date(profile.createdAt).toLocaleDateString('en-US')}
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Image className="w-4 h-4 mr-2" />
                    Start Creating
                  </Button>
                </Link>
                <Link href="/pricing" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>

              </CardContent>
            </Card>
          </div>

          {/* Right Side: Subscription Info and Usage Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CreditCard className="w-6 h-6 mr-2" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Your subscription status and benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 text-sm font-medium ${
                        profile.plan.name === 'pro'
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300'
                          : profile.plan.name === 'standard'
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-300'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300'
                      }`}
                    >
                      {profile.plan.name.toUpperCase()} Plan
                    </Badge>
                  </div>
                  <Link href="/pricing">
                    <Button size="sm" variant="outline">
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>

                {/* Plan Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Monthly Quota</h4>
                    <p className="text-2xl font-bold text-purple-600">{profile.usage.max}</p>
                    <p className="text-sm text-purple-600">Images</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4">
                    <h4 className="font-medium text-pink-800 mb-2">Image Quality</h4>
                    <p className="text-lg font-bold text-pink-600">
                      {profile.plan.hasWatermark ? 'Standard Quality' : 'HD Without Watermark'}
                    </p>
                    <p className="text-sm text-pink-600">
                      {profile.plan.hasWatermark ? 'With Watermark' : 'Professional Quality'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Image className="w-6 h-6 mr-2" />
                  This Month's Usage
                </CardTitle>
                <CardDescription>
                  View your monthly image generation usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Used: {profile.usage.current} / {profile.usage.max}
                    </span>
                    <span className="text-sm text-gray-500">
                      Remaining: {profile.usage.remaining}
                    </span>
                  </div>

                  <Progress
                    value={usagePercentage}
                    className="w-full h-3"
                  />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-lg font-bold text-green-600">{profile.usage.current}</p>
                      <p className="text-xs text-green-600">Generated</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-lg font-bold text-blue-600">{profile.usage.remaining}</p>
                      <p className="text-xs text-blue-600">Remaining</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-lg font-bold text-purple-600">{Math.round(usagePercentage)}%</p>
                      <p className="text-xs text-purple-600">Usage Rate</p>
                    </div>
                  </div>

                  {usagePercentage >= 80 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-orange-800 text-sm font-medium">
                        ⚠️ Your monthly quota is running low, consider upgrading for more generations
                      </p>
                      <Link href="/pricing" className="inline-block mt-2">
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Upgrade Now
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Account Management</CardTitle>
                <CardDescription>
                  Manage your account settings and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Login Method</h4>
                    <p className="text-sm text-gray-600">Google Account Login</p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Sync</h4>
                    <p className="text-sm text-gray-600">Creation history and preferences</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Synced
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
