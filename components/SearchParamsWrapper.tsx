'use client'

import { Suspense, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface SearchParamsWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

// 通用的SearchParams包装组件，解决所有useSearchParams的Suspense问题
export function SearchParamsWrapper({ children, fallback }: SearchParamsWrapperProps) {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">加载中...</p>
      </div>
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}