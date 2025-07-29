'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Switch } from '@/components/ui/switch' // 暂时移除，用Button替代
import { Label } from '@/components/ui/label'
import { 
  Bell, 
  Mail,
  Loader2,
  Settings,
  Save
} from 'lucide-react'
import Link from 'next/link'

interface NotificationSettings {
  emailNewsletter: boolean
  emailUpdates: boolean
  emailPromotions: boolean
  emailSecurity: boolean
}

export default function NotificationsSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNewsletter: false,
    emailUpdates: true,
    emailPromotions: false,
    emailSecurity: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 重定向未登录用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/zh/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotificationSettings()
    }
  }, [status])

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/user/notification-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // 依次更新每个设置
      for (const [setting, value] of Object.entries(settings)) {
        await fetch('/api/user/notification-settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ setting, value }),
        })
      }
      
      console.log('Notification settings updated successfully')
    } catch (error) {
      console.error('Error updating notification settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
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
          <p className="text-gray-600 mb-4">请登录以查看您的通知设置。</p>
          <Link href="/zh/auth/signin">
            <Button>登录</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 面包屑导航 */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/zh/settings" className="hover:text-gray-900">设置</Link>
          <span>/</span>
          <span className="text-gray-900">通知</span>
        </nav>
      </div>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">通知</h1>
        <p className="text-gray-600">管理您的通知设置</p>
      </div>

      <div className="grid gap-6">
        {/* 订阅管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              订阅
            </CardTitle>
            <CardDescription>
              管理您的新闻订阅偏好
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="newsletter">订阅新列表</Label>
                  <p className="text-sm text-gray-600">
                    接收我们的最新更新和新闻
                  </p>
                </div>
                <Button
                  variant={settings.emailNewsletter ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('emailNewsletter', !settings.emailNewsletter)}
                  className={settings.emailNewsletter ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {settings.emailNewsletter ? "已开启" : "已关闭"}
                </Button>
              </div>

              <div className="text-sm text-gray-600 pt-2 border-t">
                您可以随时更改订阅偏好
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 邮件通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              邮件通知
            </CardTitle>
            <CardDescription>
              选择您想要接收的邮件通知类型
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="updates">产品更新</Label>
                  <p className="text-sm text-gray-600">
                    获取新功能和改进的通知
                  </p>
                </div>
                <Button
                  variant={settings.emailUpdates ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('emailUpdates', !settings.emailUpdates)}
                  className={settings.emailUpdates ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {settings.emailUpdates ? "已开启" : "已关闭"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="promotions">促销和优惠</Label>
                  <p className="text-sm text-gray-600">
                    接收特别优惠和促销内容
                  </p>
                </div>
                <Button
                  variant={settings.emailPromotions ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('emailPromotions', !settings.emailPromotions)}
                  className={settings.emailPromotions ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {settings.emailPromotions ? "已开启" : "已关闭"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="security">安全警报</Label>
                  <p className="text-sm text-gray-600">
                    重要的安全通知（推荐开启）
                  </p>
                </div>
                <Button
                  variant={settings.emailSecurity ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('emailSecurity', !settings.emailSecurity)}
                  className={settings.emailSecurity ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {settings.emailSecurity ? "已开启" : "已关闭"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 保存设置 */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存更改
              </>
            )}
          </Button>
          
          <Link href="/zh/settings">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              返回设置
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}