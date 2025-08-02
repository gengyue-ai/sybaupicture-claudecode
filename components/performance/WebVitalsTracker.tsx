'use client'

import { useEffect } from 'react'

// 性能指标追踪组件
export function WebVitalsTracker() {
  useEffect(() => {
    // 动态导入web-vitals库，避免阻塞首屏
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // 追踪Core Web Vitals指标
      getCLS(console.log) // Cumulative Layout Shift
      getFID(console.log) // First Input Delay  
      getFCP(console.log) // First Contentful Paint
      getLCP(console.log) // Largest Contentful Paint
      getTTFB(console.log) // Time to First Byte
    }).catch(err => {
      console.warn('Failed to load web-vitals:', err)
    })
  }, [])

  return null
}

// 移动端优化的性能优化器
export function PerformanceOptimizer() {
  useEffect(() => {
    const optimizePerformance = () => {
      const isMobile = window.innerWidth <= 768
      
      // 移动端特定优化
      if (isMobile) {
        // 网络感知优化
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
        if (connection) {
          // 慢网络下减少资源加载
          if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
            // 移除非关键资源
            const nonCriticalImages = document.querySelectorAll('img:not([data-critical])')
            nonCriticalImages.forEach(img => {
              if (img instanceof HTMLImageElement) {
                img.loading = 'lazy'
              }
            })
          }
        }
        
        // 移动端GPU优化
        document.body.style.transform = 'translateZ(0)' // 强制GPU加速
        
        // 禁用hover效果节省性能
        const hoverStyles = document.createElement('style')
        hoverStyles.textContent = `
          @media (hover: none) {
            * { transition: none !important; }
            .cta-primary:hover { transform: none !important; }
          }
        `
        document.head.appendChild(hoverStyles)
      } else {
        // 桌面端优化
        const fontLink = document.createElement('link')
        fontLink.rel = 'preload'
        fontLink.as = 'font'
        fontLink.type = 'font/woff2'
        fontLink.href = '/fonts/inter-var.woff2'
        fontLink.crossOrigin = 'anonymous'
        document.head.appendChild(fontLink)
      }

      // 通用优化
      const unusedStyles = document.querySelectorAll('style[data-unused="true"]')
      unusedStyles.forEach(style => style.remove())

      // 移动端DOM压缩更激进
      if (isMobile) {
        const emptyTextNodes = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              return node.nodeValue?.trim() === '' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
            }
          }
        )
        
        const nodesToRemove: Node[] = []
        let currentNode
        while (currentNode = emptyTextNodes.nextNode()) {
          nodesToRemove.push(currentNode)
        }
        nodesToRemove.forEach(node => node.remove())
      }
    }

    // 移动端延迟更短，优先优化
    const delay = window.innerWidth <= 768 ? 500 : 1000
    
    if (document.readyState === 'complete') {
      setTimeout(optimizePerformance, delay)
    } else {
      window.addEventListener('load', () => {
        setTimeout(optimizePerformance, delay)
      })
    }
  }, [])

  return null
}