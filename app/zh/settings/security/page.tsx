'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Shield, 
  Key, 
  Trash2,
  Loader2,
  Settings,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default function SecuritySettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 重定向未登录用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/zh/auth/signin')
    }
  }, [status, router])

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('新密码不匹配')
      return
    }

    if (newPassword.length < 8) {
      alert('密码长度至少8位')
      return
    }

    try {
      setResettingPassword(true)
      
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      })

      if (response.ok) {
        alert('密码更新成功')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        alert(data.error || '密码更新失败')
      }
    } catch (error) {
      console.error('Error updating password:', error)
      alert('更新密码时发生错误')
    } finally {
      setResettingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true)
      
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // 重定向到登出页面
        window.location.href = '/zh/auth/signin?message=account-deleted'
      } else {
        const data = await response.json()
        alert(data.error || '删除账户失败')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('删除账户时发生错误')
    } finally {
      setDeletingAccount(false)
      setShowDeleteConfirm(false)
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
          <p className="text-gray-600 mb-4">请登录以查看您的安全设置。</p>
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
          <span className="text-gray-900">安全</span>
        </nav>
      </div>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">安全</h1>
        <p className="text-gray-600">管理您的安全设置</p>
      </div>

      <div className="grid gap-6">
        {/* 重置密码 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              重置密码
            </CardTitle>
            <CardDescription>
              更改您的账户密码以保证账户安全
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">当前密码</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="new-password">新密码</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  className="mt-1"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleResetPassword}
                  disabled={resettingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {resettingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      重置密码
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 删除账号 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Trash2 className="mr-2 h-5 w-5" />
              删除账号
            </CardTitle>
            <CardDescription>
              永久删除您的账户和所有相关数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-medium">警告：此操作无法撤销</h4>
                    <p className="text-red-700 text-sm mt-1">
                      删除您的账户将永久移除所有数据，包括：
                    </p>
                    <ul className="text-red-700 text-sm mt-2 list-disc list-inside">
                      <li>所有生成的图片和历史记录</li>
                      <li>账户设置和偏好</li>
                      <li>订阅和账单信息</li>
                    </ul>
                  </div>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除账号
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium">
                    您确定要删除您的账户吗？
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      variant="destructive"
                    >
                      {deletingAccount ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          删除中...
                        </>
                      ) : (
                        '确认删除账户'
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 返回设置 */}
        <div className="flex justify-end">
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