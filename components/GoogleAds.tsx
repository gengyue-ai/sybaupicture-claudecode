'use client'

import { useEffect } from 'react'
import Script from 'next/script'

// 谷歌广告配置
const GOOGLE_ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
const GOOGLE_ADS_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID

// Google AdSense 组件
export function GoogleAdSense() {
  if (!GOOGLE_ADSENSE_ID) {
    return null
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script
        id="google-adsense-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "${GOOGLE_ADSENSE_ID}",
              enable_page_level_ads: true
            });
          `,
        }}
      />
    </>
  )
}

// Google Analytics 4 组件
export function GoogleAnalytics() {
  if (!GA4_MEASUREMENT_ID) {
    console.warn('⚠️ GA4_MEASUREMENT_ID 未配置，跳过Google Analytics')
    return null
  }

  // 验证 GA4 ID 格式
  if (!GA4_MEASUREMENT_ID.startsWith('G-')) {
    console.error('❌ GA4_MEASUREMENT_ID 格式错误，应该以 G- 开头:', GA4_MEASUREMENT_ID)
    return null
  }

  console.log('✅ 初始化 Google Analytics:', GA4_MEASUREMENT_ID)

  return (
    <>
      {/* Google Analytics 4 - 简化版本 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Google Analytics 脚本加载成功')
        }}
        onError={(e) => {
          console.error('❌ Google Analytics 脚本加载失败:', e)
        }}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            try {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_MEASUREMENT_ID}');
              console.log('✅ Google Analytics 配置完成:', '${GA4_MEASUREMENT_ID}');
            } catch (error) {
              console.error('❌ Google Analytics 初始化失败:', error);
            }
          `,
        }}
      />
    </>
  )
}

// Google Ads 转化跟踪组件
export function GoogleAdsConversion() {
  if (!GOOGLE_ADS_CONVERSION_ID) {
    return null
  }

  return (
    <Script
      id="google-ads-conversion"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          gtag('config', '${GOOGLE_ADS_CONVERSION_ID}');
        `,
      }}
    />
  )
}

// 单个广告单元组件
interface GoogleAdUnitProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  width?: number
  height?: number
  className?: string
}

export function GoogleAdUnit({ 
  adSlot, 
  adFormat = 'auto', 
  width = 320, 
  height = 100,
  className = ''
}: GoogleAdUnitProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle && GOOGLE_ADSENSE_ID) {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [])

  if (!GOOGLE_ADSENSE_ID) {
    return null
  }

  return (
    <div className={`google-ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          width: adFormat === 'auto' ? '100%' : `${width}px`,
          height: adFormat === 'auto' ? 'auto' : `${height}px`
        }}
        data-ad-client={GOOGLE_ADSENSE_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// 页面级广告组件
export function GooglePageAds() {
  return (
    <>
      <GoogleAdSense />
      <GoogleAnalytics />
      <GoogleAdsConversion />
    </>
  )
}

// 类型声明
declare global {
  interface Window {
    adsbygoogle: unknown[]
    gtag: (...args: unknown[]) => void
  }
} 