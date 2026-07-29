'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  /** 广告单元ID，从AdSense后台获取 */
  adSlot: string
  /** 广告格式 */
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  /** 额外的CSS类名 */
  className?: string
  /** 广告位名称，用于调试 */
  adName?: string
}

/**
 * Google AdSense 手动广告单元组件
 * 与自动广告共存，互不干扰
 */
export function AdUnit({ 
  adSlot, 
  adFormat = 'auto', 
  className = '', 
  adName 
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!adRef.current || pushed.current) return

    const tryPush = () => {
      const win = window as any
      // 确保 adsbygoogle 数组存在
      if (!win.adsbygoogle) {
        win.adsbygoogle = []
      }
      // 确保 push 方法存在（Google SDK 加载后才会设置）
      if (typeof win.adsbygoogle.push === 'function') {
        win.adsbygoogle.push({})
        pushed.current = true
        return true
      }
      return false
    }

    // 立即尝试
    if (tryPush()) return

    // 如果 SDK 还没加载，设置轮询等待
    let attempts = 0
    const maxAttempts = 50
    const interval = setInterval(() => {
      attempts++
      if (tryPush() || attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [adName])

  return (
    <div ref={adRef} className={`ad-unit-container ${className}`}>
      {/* douad */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1000714999006921"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}

/**
 * 预定义的广告单元 - douad
 * 可直接在页面中引用
 */
export function DouAd({ className }: { className?: string }) {
  return (
    <AdUnit
      adSlot="9586095995"
      adFormat="auto"
      adName="douad"
      className={className}
    />
  )
}
