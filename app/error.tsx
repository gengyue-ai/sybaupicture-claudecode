'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 错误图标 */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full animate-bounce"></div>
        </div>

        {/* 错误信息 */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground text-lg">
            An unexpected error occurred. Don't worry, we're on it!
          </p>
          
          {/* 开发环境显示错误详情 */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-red-50 rounded-lg text-left">
              <summary className="cursor-pointer text-red-700 font-medium">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-auto">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-2 text-xs text-gray-600">
                  Error ID: {error.digest}
                </p>
              )}
            </details>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="default" 
            onClick={reset}
            className="min-w-[140px]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            asChild
            className="min-w-[140px]"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* 帮助信息 */}
        <div className="pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please refresh the page or try again later.
          </p>
        </div>
      </div>
    </div>
  )
} 