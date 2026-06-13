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
    if (adRef.current && !pushed.current) {
      try {
        const win = window as any
        if (win.adsbygoogle) {
          win.adsbygoogle.push({})
          pushed.current = true
        } else {
          // 如果adsbygoogle未加载，等待加载后再push
          const observer = new MutationObserver(() => {
            if (win.adsbygoogle && !pushed.current) {
              win.adsbygoogle.push({})
              pushed.current = true
              observer.disconnect()
            }
          })
          observer.observe(document.body, { childList: true, subtree: true })
          // 超时兜底
          setTimeout(() => observer.disconnect(), 10000)
        }
      } catch (e) {
        console.error(`AdSense push error${adName ? ` (${adName})` : ''}:`, e)
      }
    }
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
