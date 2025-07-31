'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, RefreshCw, Home, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const debug = searchParams.get('debug')
  
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (debug === 'true') {
      fetchErrorDetails()
    }
  }, [debug])

  const fetchErrorDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/oauth-error')
      if (response.ok) {
        const data = await response.json()
        setErrorDetails(data)
      }
    } catch (err) {
      console.error('获取错误详情失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (errorType: string | null) => {
    const errorMessages: Record<string, { title: string; description: string; severity: 'error' | 'warning' }> = {
      'OAuthCallback': {
        title: 'OAuth回调错误',
        description: 'Google登录回调处理失败，通常是配置问题导致',
        severity: 'error'
      },
      'AccessDenied': {
        title: '访问被拒绝',
        description: '用户取消了Google授权或权限不足',
        severity: 'warning'
      },
      'Configuration': {
        title: '配置错误',
        description: 'OAuth配置有误，请检查环境变量',
        severity: 'error'
      },
      'Default': {
        title: '登录失败',
        description: '发生了未知错误，请重试',
        severity: 'error'
      }
    }

    return errorMessages[errorType || 'Default']
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* 主错误卡片 */}
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-700">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {errorInfo.description}
            </CardDescription>
            {error && (
              <Badge variant="destructive" className="mt-2 mx-auto">
                错误代码: {error}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 快速操作 */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild>
                <Link href="/auth/signin">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重试登录
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Link>
              </Button>
              {!debug && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = window.location.href + '&debug=true'}
                >
                  查看详情
                </Button>
              )}
            </div>

            {/* 调试信息 */}
            {debug === 'true' && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-700">调试信息</h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={fetchErrorDetails}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    刷新
                  </Button>
                </div>

                {errorDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {/* 错误分析 */}
                    {errorDetails.errorAnalysis?.hasError && (
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">错误分析</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>类型:</strong> {errorDetails.errorAnalysis.type}</p>
                          <p><strong>描述:</strong> {errorDetails.errorAnalysis.description}</p>
                          
                          {errorDetails.errorAnalysis.possibleCauses?.length > 0 && (
                            <div>
                              <strong>可能原因:</strong>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {errorDetails.errorAnalysis.possibleCauses.map((cause: string, index: number) => (
                                  <li key={index}>{cause}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {errorDetails.errorAnalysis.solutions?.length > 0 && (
                            <div>
                              <strong>解决方案:</strong>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {errorDetails.errorAnalysis.solutions.map((solution: string, index: number) => (
                                  <li key={index}>{solution}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* OAuth参数 */}
                    {errorDetails.oauthParams && (
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">OAuth参数</h5>
                        <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                          {JSON.stringify(errorDetails.oauthParams, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Cookie信息 */}
                    {errorDetails.cookies && (
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Cookie状态</h5>
                        <div className="text-sm text-gray-600">
                          <p>NextAuth Cookies: {errorDetails.cookies.nextAuthCookies}</p>
                          <p>总Cookie数: {errorDetails.cookies.total}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 帮助链接 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">需要帮助？</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/api/debug/oauth-diagnosis" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  OAuth配置检查
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/debug/session" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  会话状态测试
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://console.cloud.google.com/apis/credentials" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Google Console
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/support">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  技术支持
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
} 