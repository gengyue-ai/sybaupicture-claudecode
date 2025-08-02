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

// 性能优化提示
export function PerformanceOptimizer() {
  useEffect(() => {
    // 延迟执行性能优化任务
    const optimizePerformance = () => {
      // 预加载关键字体
      const fontLink = document.createElement('link')
      fontLink.rel = 'preload'
      fontLink.as = 'font'
      fontLink.type = 'font/woff2'
      fontLink.href = '/fonts/inter-var.woff2'
      fontLink.crossOrigin = 'anonymous'
      document.head.appendChild(fontLink)

      // 移除未使用的CSS
      const unusedStyles = document.querySelectorAll('style[data-unused="true"]')
      unusedStyles.forEach(style => style.remove())

      // 压缩DOM
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

    // 页面加载完成后优化
    if (document.readyState === 'complete') {
      setTimeout(optimizePerformance, 1000)
    } else {
      window.addEventListener('load', () => {
        setTimeout(optimizePerformance, 1000)
      })
    }
  }, [])

  return null
}