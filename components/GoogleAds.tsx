'use client'

import Script from 'next/script'

// Google AdSense 自动广告组件 - 简化版
// 只包含Google官方提供的AdSense代码
export function GoogleAdSense() {
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1000714999006921"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}

// 页面级广告组件 - 只包含AdSense自动广告
export function GooglePageAds() {
  return <GoogleAdSense />
}