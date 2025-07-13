import { Metadata } from 'next'
import HomePageClient from '@/components/HomePageClient'

export const metadata: Metadata = {
  title: 'Sybau Picture | Create Viral Creative Content - Stay Young, Beautiful and Unique',
  description: 'Transform text or images into stunning creative visuals with AI. Experience the Sybau culture inspired by Gen Z - Stay Young, Beautiful and Unique!',
  openGraph: {
    title: 'Sybau Picture | Create Viral Creative Content',
    description: 'Transform text or images into stunning creative visuals with AI. Experience the Sybau culture - Stay Young, Beautiful and Unique!',
    images: ['/og-image.webp'],
  },
}

export default function HomePage() {
  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Sybau Picture Generator",
            "description": "AI-powered tool to create viral Sybau-style memes from any photo",
            "url": "https://sybaupicture.com",
            "applicationCategory": "PhotoEditingApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization",
              "name": "Sybau Picture"
            }
          })
        }}
      />

      <HomePageClient />
    </>
  )
}
