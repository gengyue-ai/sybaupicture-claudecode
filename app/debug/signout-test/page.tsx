'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignOutTestPage() {
  const { data: session, status } = useSession()

  const handleForceSignOut = async () => {
    try {
      console.log('🔄 开始强制退出登录...')
      
      // 1. 调用自定义signout API
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })
      console.log('✅ 自定义signout API:', response.ok)
      
      // 2. 调用NextAuth signOut
      await signOut({ 
        redirect: false,
        callbackUrl: '/'
      })
      console.log('✅ NextAuth signOut完成')
      
      // 3. 清除本地存储
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        console.log('✅ 本地存储已清除')
      }
      
      // 4. 延迟刷新页面
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
      
    } catch (error) {
      console.error('❌ 强制退出登录失败:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>退出登录测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">当前会话状态</h3>
            <p className="text-sm text-gray-600">
              状态: {status} <br/>
              用户: {session?.user?.email || '未登录'}
            </p>
          </div>
          
          {session && (
            <div className="space-y-2">
              <Button 
                onClick={handleForceSignOut}
                className="w-full"
                variant="destructive"
              >
                强制完全退出登录
              </Button>
              
              <Button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full"
                variant="outline"
              >
                标准退出登录
              </Button>
            </div>
          )}
          
          {!session && (
            <p className="text-green-600">✅ 未检测到活跃会话</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}