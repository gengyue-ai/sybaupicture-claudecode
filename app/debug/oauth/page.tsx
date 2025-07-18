'use client'

import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OAuthDebugPage() {
  const { data: session, status } = useSession()

  const handleGoogleSignIn = async () => {
    console.log('🔄 开始测试Google登录')
    try {
      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false
      })
      console.log('signIn结果:', result)
    } catch (error) {
      console.error('signIn错误:', error)
    }
  }

  const handleGoogleSignInWithRedirect = async () => {
    console.log('🔄 开始测试Google登录（带重定向）')
    await signIn('google', {
      callbackUrl: '/'
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>OAuth 调试页面</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">当前状态</h3>
            <pre className="bg-gray-200 p-4 rounded text-sm">
{JSON.stringify({ 
  status, 
  session: session ? {
    user: session.user,
    expires: session.expires
  } : null 
}, null, 2)}
            </pre>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">测试Google登录</h3>
            
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full"
              variant="outline"
            >
              测试Google登录（无重定向）
            </Button>
            
            <Button 
              onClick={handleGoogleSignInWithRedirect}
              className="w-full"
            >
              测试Google登录（带重定向）
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">环境信息</h3>
            <pre className="bg-gray-200 p-4 rounded text-sm">
{JSON.stringify({
  window_location: typeof window !== 'undefined' ? window.location.href : 'N/A',
  nextauth_url: process.env.NEXTAUTH_URL || 'Not set',
  has_google_config: !!(process.env.GOOGLE_CLIENT_ID)
}, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}