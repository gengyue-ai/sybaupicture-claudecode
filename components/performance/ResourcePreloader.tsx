'use client'

import { useEffect } from 'react'

// 预加载关键资源
export function ResourcePreloader() {
  useEffect(() => {
    // 预加载关键图片
    const criticalImages = [
      '/images/hero-showcase/hero-removal-before.webp',
      '/images/hero-showcase/hero-removal-after.webp',
      '/logo.svg',
      '/favicon.svg'
    ]

    criticalImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })

    // 预连接到外部域名
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://fal.media',
      'https://api.fal.ai'
    ]

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })

    // 预加载关键CSS
    const criticalCSS = document.createElement('link')
    criticalCSS.rel = 'preload'
    criticalCSS.as = 'style'
    criticalCSS.href = '/globals.css'
    document.head.appendChild(criticalCSS)

  }, [])

  return null
}