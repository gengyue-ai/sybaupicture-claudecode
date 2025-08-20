'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface GoogleAnalyticsProps {
  measurementId?: string
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const GA_MEASUREMENT_ID = measurementId || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-1TJWFMERWY'

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
        page_title: document.title,
        page_location: window.location.href,
      })
      
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_title: document.title,
        page_location: window.location.href,
      })
      
      console.log('GA页面浏览事件已发送:', pathname)
    }
  }, [pathname, GA_MEASUREMENT_ID])

  useEffect(() => {
    const checkGA = () => {
      if (typeof window !== 'undefined') {
        console.log('GA状态检查:', {
          gtag: typeof window.gtag,
          dataLayer: window.dataLayer?.length || 0,
          measurementId: GA_MEASUREMENT_ID,
          currentPath: pathname
        })
        
        if (window.gtag) {
          console.log('GA已正确加载并可用')
        } else {
          console.warn('GA未加载或不可用')
        }
      }
    }
    
    setTimeout(checkGA, 3000)
  }, [GA_MEASUREMENT_ID, pathname])

  if (!GA_MEASUREMENT_ID) {
    console.warn('GA Measurement ID未找到')
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => console.log('GA脚本已成功加载')}
        onError={(e) => console.error('GA脚本加载失败:', e)}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              cookie_flags: 'SameSite=None;Secure',
              enhanced_measurement: true,
              debug_mode: ${process.env.NODE_ENV === 'development'}
            });
            
            console.log('GA初始化完成:', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  )
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}