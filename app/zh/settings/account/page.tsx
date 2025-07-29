'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Camera, 
  Save,
  Loader2,
  Upload,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { UserAvatar } from '@/components/ui/UserAvatar'

export default function AccountSettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // 重定向未登录用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/zh/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')
    }
  }, [session])

  // 🔧 修复：页面加载时刷新session，确保获取最新的头像信息
  useEffect(() => {
    if (status === 'authenticated') {
      // 强制更新session以获取最新的用户信息（包括头像）
      update()
    }
  }, [status, update])

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email
        }),
      })

      if (response.ok) {
        // 更新session数据
        await update({
          ...session,
          user: {
            ...session?.user,
            name,
            email
          }
        })
        
        // 可以添加成功提示
        console.log('Profile updated successfully')
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        // 更新session中的头像
        await update({
          ...session,
          user: {
            ...session?.user,
            image: data.avatarUrl
          }
        })
      } else {
        console.error('Failed to upload avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
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
          <p className="text-gray-600 mb-4">请登录以查看您的账户设置。</p>
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
          <span className="text-gray-900">账户</span>
        </nav>
      </div>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">账户设置</h1>
        <p className="text-gray-600">管理您的账户信息和偏好设置</p>
      </div>

      <div className="grid gap-6">
        {/* 头像设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="mr-2 h-5 w-5" />
              头像
            </CardTitle>
            <CardDescription>
              上传新的头像
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <UserAvatar
                  image={session?.user?.image}
                  name={session?.user?.name}
                  email={session?.user?.email}
                  size="xl"
                  className="w-20 h-20"
                />
                {loading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="mb-4">
                  <Label htmlFor="avatar-upload" className="sr-only">
                    上传头像
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <Button
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    variant="outline"
                    disabled={loading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    上传新头像
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  建议：正方形图片，至少200x200像素。最大文件大小：5MB。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              基本信息
            </CardTitle>
            <CardDescription>
              更新您的姓名和邮箱地址
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入您的姓名"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入您的邮箱地址"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    此邮箱将用于账户通知和登录。
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || !email.trim()}
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
          </CardContent>
        </Card>

        {/* 账户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
            <CardDescription>
              查看您的账户详细信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">账户创建日期</Label>
                  <p className="text-sm">
                    {session?.user ? new Date().toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '不可用'}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">账户状态</Label>
                  <p className="text-sm">正常</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}