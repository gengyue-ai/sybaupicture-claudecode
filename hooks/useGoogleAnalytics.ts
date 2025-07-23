'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Google Analytics 页面跟踪 Hook
export function useGoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      
      // 发送页面视图事件
      window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href
      })

      // 额外发送页面视图事件（确保数据收集）
      window.gtag('event', 'page_view', {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href
      })

      console.log('📊 GA4 页面跟踪:', url)
    }
  }, [pathname, searchParams])
}

// Google Analytics 事件跟踪函数
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
    console.log('📊 GA4 事件跟踪:', eventName, parameters)
  }
}

// 常用事件跟踪函数
export const analytics = {
  // 页面视图
  pageView: (pagePath: string, pageTitle?: string) => {
    trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href
    })
  },

  // 用户注册
  signUp: (method: string) => {
    trackEvent('sign_up', { method })
  },

  // 用户登录
  login: (method: string) => {
    trackEvent('login', { method })
  },

  // 图片生成
  generateImage: (prompt: string, model?: string) => {
    trackEvent('generate_image', {
      prompt_length: prompt.length,
      model: model || 'default'
    })
  },

  // 购买事件
  purchase: (value: number, currency: string = 'USD', items?: any[]) => {
    trackEvent('purchase', {
      value,
      currency,
      items
    })
  },

  // 自定义事件
  custom: (eventName: string, parameters?: Record<string, any>) => {
    trackEvent(eventName, parameters)
  }
}