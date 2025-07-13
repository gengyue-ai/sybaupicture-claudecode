'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录全局错误
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-8">
            {/* 严重错误图标 */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>

            {/* 错误信息 */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Critical Error
              </h1>
              <p className="text-gray-600 text-lg">
                A critical error occurred that prevented the application from running properly.
              </p>
              
              {/* 开发环境显示错误详情 */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-4 bg-red-50 rounded-lg text-left border border-red-200">
                  <summary className="cursor-pointer text-red-700 font-medium">
                    Technical Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap">
                    {error.message}
                    {error.stack && `\n\nStack trace:\n${error.stack}`}
                  </pre>
                  {error.digest && (
                    <p className="mt-2 text-xs text-gray-600">
                      Error ID: {error.digest}
                    </p>
                  )}
                </details>
              )}
            </div>

            {/* 恢复按钮 */}
            <div className="space-y-3">
              <Button 
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Application
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>

            {/* 帮助信息 */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If this problem persists, please clear your browser cache and try again.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 