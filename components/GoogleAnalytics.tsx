'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'

interface GoogleAnalyticsProps {
  measurementId?: string
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const GA_MEASUREMENT_ID = measurementId || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

  // 使用页面跟踪Hook
  useGoogleAnalytics()

  if (!GA_MEASUREMENT_ID) {
    console.warn('⚠️ Google Analytics Measurement ID not configured')
    return null
  }

  return (
    <>
      {/* Google Analytics gtag.js */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
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
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
            console.log('📊 Google Analytics initialized:', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  )
}