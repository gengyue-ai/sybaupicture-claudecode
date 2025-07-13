import Script from 'next/script'

// 谷歌AdSense头部组件 - 专门用于head标签
export function GoogleAdSenseHead() {
  const GOOGLE_ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID

  if (!GOOGLE_ADSENSE_ID) {
    return null
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_ID}`}
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      />
      <Script
        id="google-adsense-init"
        strategy="beforeInteractive"
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