'use client'

import { useEffect } from 'react'

// 移动端LCP专项优化组件
export function MobileLCPOptimizer() {
  useEffect(() => {
    // 仅在移动端执行
    if (typeof window === 'undefined' || window.innerWidth > 768) return

    // 移动端LCP关键优化
    const optimizeMobileLCP = () => {
      // 1. 预连接关键域名
      const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ]
      
      preconnectDomains.forEach(domain => {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = domain
        link.crossOrigin = 'anonymous'
        if (!document.querySelector(`link[href="${domain}"]`)) {
          document.head.appendChild(link)
        }
      })

      // 2. 移动端图片懒加载优化
      const heroImages = document.querySelectorAll('[data-hero-image]')
      heroImages.forEach(img => {
        if (img instanceof HTMLImageElement) {
          // 移动端使用更小的图片
          const currentSrc = img.src
          if (currentSrc.includes('hero-removal') && !currentSrc.includes('?w=')) {
            // 为移动端添加宽度参数，触发Next.js优化
            img.src = currentSrc + '?w=640&q=75'
          }
        }
      })

      // 3. 移动端网络感知
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        // 慢网络下进一步优化
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          document.documentElement.style.setProperty('--image-quality', '60')
          
          // 延迟加载非关键图片
          const nonCriticalImages = document.querySelectorAll('img:not([data-critical])')
          nonCriticalImages.forEach(img => {
            if (img instanceof HTMLImageElement && !img.loading) {
              img.loading = 'lazy'
            }
          })
        }
      }

      // 4. 强制GPU加速关键元素
      const criticalElements = document.querySelectorAll('.hero-section, .bg-gradient-to-br')
      criticalElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.transform = 'translateZ(0)'
          el.style.willChange = 'transform'
        }
      })
    }

    // 立即执行优化
    optimizeMobileLCP()

    // 监听网络变化
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', optimizeMobileLCP)
      
      return () => {
        connection?.removeEventListener('change', optimizeMobileLCP)
      }
    }
  }, [])

  return null
}

// 移动端LCP预加载组件
export function MobileLCPPreloader() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth > 768) return

    // 移动端关键资源预加载
    const preloadResources = [
      { href: '/images/hero-showcase/hero-removal-before.webp', as: 'image' },
      { href: '/images/hero-showcase/hero-removal-after.webp', as: 'image' },
    ]

    preloadResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource.href
      link.as = resource.as
      link.fetchPriority = 'high'
      
      // 移动端使用更小的图片
      if (resource.as === 'image') {
        link.href = resource.href + '?w=640&q=75'
      }
      
      document.head.appendChild(link)
    })
  }, [])

  return null
}