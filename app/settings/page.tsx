'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  CreditCard, 
  Shield, 
  Bell,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

const settingsItems = [
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your account information and preferences',
    icon: User,
    href: '/settings/account'
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'View and manage your subscription and billing information',
    icon: CreditCard,
    href: '/billing'
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Password, two-factor authentication, and security settings',
    icon: Shield,
    href: '/settings/security'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure your notification preferences',
    icon: Bell,
    href: '/settings/notifications'
  }
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // 重定向未登录用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* 用户信息卡片 */}
      {session?.user && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {session.user.name || 'User'}
                </h2>
                <p className="text-gray-600">{session.user.email}</p>
                <div className="mt-2">
                  <Badge variant="secondary">
                    {(session.user as any).planName || 'Free'} Plan
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 设置选项 */}
      <div className="grid gap-4">
        {settingsItems.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <Link 
                  href={item.href}
                  className="flex items-center p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 底部信息 */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Need help? Contact our{' '}
          <Link href="/help" className="text-blue-600 hover:text-blue-700">
            support team
          </Link>
        </p>
      </div>
    </div>
  )
}