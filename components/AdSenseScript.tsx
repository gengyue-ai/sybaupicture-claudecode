import Script from 'next/script'

export function AdSenseScript() {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1000714999006921"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-1000714999006921",
              enable_page_level_ads: true
            });
          `,
        }}
      />
    </>
  )
} 