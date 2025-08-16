'use client'

import { useEffect } from 'react'

// 异步CSS加载组件 - 减少渲染阻塞
export function AsyncCSS() {
  useEffect(() => {
    // 异步加载非关键CSS
    const loadNonCriticalCSS = () => {
      // 检查CSS是否已加载
      const existingLinks = document.querySelectorAll('link[data-async-css]')
      if (existingLinks.length > 0) return

      // 预加载策略：先预加载，然后异步应用
      const preloadCSS = (href: string) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'style'
        link.href = href
        link.setAttribute('data-async-css', 'true')
        
        link.onload = () => {
          // 预加载完成后，改为stylesheet
          link.rel = 'stylesheet'
        }
        
        document.head.appendChild(link)
      }

      // 延迟加载非首屏关键的CSS
      setTimeout(() => {
        // 这里可以添加非关键CSS文件的预加载
        // 目前保持安全，不加载额外CSS
      }, 100)
    }

    // 在首屏内容加载完成后执行
    if (document.readyState === 'complete') {
      loadNonCriticalCSS()
    } else {
      window.addEventListener('load', loadNonCriticalCSS)
      return () => window.removeEventListener('load', loadNonCriticalCSS)
    }
  }, [])

  return null
}