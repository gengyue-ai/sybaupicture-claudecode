'use client'

import { useEffect } from 'react'

// 轻量级性能监控组件
export function PerformanceMonitor() {
  useEffect(() => {
    // 只在开发环境下启用详细监控
    if (process.env.NODE_ENV === 'development') {
      // 监控页面加载性能
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            console.log('🚀 Page Load Performance:', {
              pageLoad: Math.round(navEntry.loadEventEnd - navEntry.loadEventStart),
              domReady: Math.round(navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart),
              totalTime: Math.round(navEntry.loadEventEnd - navEntry.fetchStart)
            })
          }
        })
      })
      
      try {
        observer.observe({ entryTypes: ['navigation'] })
      } catch (e) {
        // Graceful degradation for older browsers
      }

      return () => observer.disconnect()
    }
  }, [])

  // 在生产环境下不渲染任何内容
  return null
}

// Web Vitals监控（仅开发环境）
export function WebVitalsMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 监控核心Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const metricName = entry.name
          // 安全地获取value属性
          const value = (entry as any).value ? Math.round((entry as any).value) : 0
          
          console.log(`📊 Web Vital - ${metricName}:`, value)
        })
      })
      
      try {
        observer.observe({ entryTypes: ['measure'] })
      } catch (e) {
        // Graceful degradation
      }

      return () => observer.disconnect()
    }
  }, [])

  return null
}