'use client'

import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'
import { Suspense } from 'react'

// GA4 跟踪组件
function GoogleAnalyticsTrackerInner() {
  useGoogleAnalytics()
  return null
}

// 带 Suspense 的 GA4 跟踪组件
export function GoogleAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsTrackerInner />
    </Suspense>
  )
}