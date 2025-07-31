'use client'

import { track } from '@vercel/analytics'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Vercel Analytics 扩展跟踪功能
export function useVercelAnalytics() {
  const pathname = usePathname()

  // 页面浏览跟踪
  useEffect(() => {
    // Vercel Analytics 自动跟踪页面浏览，但我们可以添加自定义属性
    const currentLang = pathname.startsWith('/zh') ? 'zh' : 'en'
    track('page_view', {
      page: pathname,
      language: currentLang,
      timestamp: new Date().toISOString()
    })
  }, [pathname])
}

// Vercel Analytics 事件跟踪函数
export const vercelAnalytics = {
  // 用户注册
  signUp: (method: string, plan?: string) => {
    track('user_signup', { 
      method, 
      plan: plan || 'free',
      timestamp: new Date().toISOString()
    })
  },

  // 用户登录
  login: (method: string) => {
    track('user_login', { 
      method,
      timestamp: new Date().toISOString()
    })
  },

  // 图片生成
  generateImage: (templateId?: string, mode?: string) => {
    track('image_generation', {
      template_id: templateId || 'custom',
      generation_mode: mode || 'image-to-image',
      timestamp: new Date().toISOString()
    })
  },

  // 订阅升级
  subscriptionUpgrade: (fromPlan: string, toPlan: string, amount: number) => {
    track('subscription_upgrade', {
      from_plan: fromPlan,
      to_plan: toPlan,
      amount,
      currency: 'USD',
      timestamp: new Date().toISOString()
    })
  },

  // 支付完成
  paymentCompleted: (plan: string, amount: number, paymentMethod: string) => {
    track('payment_completed', {
      plan,
      amount,
      currency: 'USD',
      payment_method: paymentMethod,
      timestamp: new Date().toISOString()
    })
  },

  // 用户流失点跟踪
  userDropoff: (location: string, reason?: string) => {
    track('user_dropoff', {
      location,
      reason: reason || 'unknown',
      timestamp: new Date().toISOString()
    })
  },

  // 功能使用
  featureUsage: (feature: string, context?: Record<string, any>) => {
    track('feature_usage', {
      feature,
      ...context,
      timestamp: new Date().toISOString()
    })
  },

  // 错误跟踪
  errorOccurred: (errorType: string, errorMessage: string, location: string) => {
    track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage.substring(0, 100), // 限制长度
      location,
      timestamp: new Date().toISOString()
    })
  },

  // A/B测试跟踪
  abTestVariant: (testName: string, variant: string) => {
    track('ab_test_variant', {
      test_name: testName,
      variant,
      timestamp: new Date().toISOString()
    })
  },

  // 自定义事件
  custom: (eventName: string, properties?: Record<string, any>) => {
    track(eventName, {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }
}

// 性能监控Hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    // 监控页面加载性能
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            track('page_performance', {
              dns_time: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              connect_time: navEntry.connectEnd - navEntry.connectStart,
              response_time: navEntry.responseEnd - navEntry.responseStart,
              dom_load_time: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
              page_load_time: navEntry.loadEventEnd - navEntry.navigationStart,
              timestamp: new Date().toISOString()
            })
          }
        })
      })

      observer.observe({ entryTypes: ['navigation'] })
      
      // 清理函数
      return () => observer.disconnect()
    }
  }, [])
}