'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404动画图标 */}
        <div className="relative">
          <div className="text-8xl font-bold text-primary/20 animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* 错误信息 */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="default" 
            asChild
            className="min-w-[140px]"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="min-w-[140px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* 帮助链接 */}
        <div className="pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4">
            Need help? Try these popular pages:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link 
              href="/" 
              className="text-sm text-primary hover:underline"
            >
              Home
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/zh" 
              className="text-sm text-primary hover:underline"
            >
              中文版
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/test-lang" 
              className="text-sm text-primary hover:underline"
            >
              Language Test
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 