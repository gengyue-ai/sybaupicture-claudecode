'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function SessionTestPage() {
  const { data: session, status, update } = useSession()
  const [serverSession, setServerSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchServerSession = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/debug/session-test')
      if (response.ok) {
        const data = await response.json()
        setServerSession(data)
      } else {
        setError('无法获取服务器会话信息')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServerSession()
  }, [])

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/debug/session' })
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/debug/session' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">会话测试页面</h1>
          <p className="text-gray-600">测试OAuth登录会话状态</p>
        </div>

        {/* 客户端会话状态 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              客户端会话状态
            </CardTitle>
            <CardDescription>
              从 useSession() 获取的会话信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>
                  状态: {status === 'authenticated' ? '已登录' : status === 'loading' ? '加载中' : '未登录'}
                </Badge>
              </div>
              
              {session && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">会话信息:</h4>
                  <pre className="text-sm text-gray-700 overflow-x-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                {!session ? (
                  <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    使用Google登录
                  </Button>
                ) : (
                  <Button onClick={handleSignOut} variant="outline">
                    退出登录
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 服务器端会话状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              服务器端会话状态
              <Button 
                onClick={fetchServerSession} 
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                刷新
              </Button>
            </CardTitle>
            <CardDescription>
              从服务器API获取的会话信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">加载中...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}
            
            {serverSession && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">服务器会话信息:</h4>
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(serverSession, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 测试说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>测试说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. 点击"使用Google登录"按钮测试登录流程</p>
              <p>2. 登录后检查客户端和服务器端的会话状态是否一致</p>
              <p>3. 如果登录后重定向到登录页面，检查控制台错误信息</p>
              <p>4. 点击"刷新"按钮重新获取服务器会话状态</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 