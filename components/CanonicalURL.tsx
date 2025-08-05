'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function CanonicalURL() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 移除所有现有的canonical标签
    const existingCanonical = document.querySelector('link[rel="canonical"]')
    if (existingCanonical) {
      existingCanonical.remove()
    }

    // 创建新的canonical URL，忽略所有查询参数
    const canonicalUrl = `https://sybaupicture.com${pathname}`
    
    // 添加新的canonical标签
    const canonicalLink = document.createElement('link')
    canonicalLink.rel = 'canonical'
    canonicalLink.href = canonicalUrl
    document.head.appendChild(canonicalLink)
    
    console.log('🔗 Canonical URL set:', canonicalUrl)
  }, [pathname]) // 不依赖searchParams，确保查询参数不影响canonical

  return null
}