import Script from 'next/script'

interface SEOStructuredDataProps {
  type?: 'website' | 'gallery' | 'pricing' | 'help'
  title?: string
  description?: string
  url?: string
}

export default function SEOStructuredData({ 
  type = 'website', 
  title,
  description,
  url 
}: SEOStructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Sybau Picture",
      "alternateName": ["SP", "Sybau"],
      "url": "https://sybaupicture.com",
      "description": "AI-powered image generation platform - Stay Young, Beautiful & Unique",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://sybaupicture.com/gallery?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "sameAs": [
        "https://sybaupicture.com",
        "https://sybaupicture.com/zh"
      ]
    }

    switch (type) {
      case 'gallery':
        return {
          ...baseData,
          "@type": "ImageGallery",
          "name": title || "Sybau Picture AI Gallery",
          "description": description || "Explore stunning AI-generated Sybau pictures created by our community",
          "url": url || "https://sybaupicture.com/gallery",
          "mainEntity": {
            "@type": "ItemList",
            "name": "AI Generated Images",
            "description": "Collection of AI-generated Sybau style images"
          }
        }
      
      case 'pricing':
        return {
          ...baseData,
          "@type": "Service",
          "name": title || "Sybau Picture AI Service",
          "description": description || "AI image generation service with flexible pricing plans",
          "url": url || "https://sybaupicture.com/pricing",
          "provider": {
            "@type": "Organization",
            "name": "Sybau Picture"
          },
          "offers": [
            {
              "@type": "Offer",
              "name": "Free Plan",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free trial with basic features"
            },
            {
              "@type": "Offer",
              "name": "Standard Plan",
              "price": "9.99",
              "priceCurrency": "USD",
              "billingIncrement": "P1M",
              "description": "Monthly subscription with enhanced features"
            }
          ]
        }
      
      case 'help':
        return {
          ...baseData,
          "@type": "FAQPage",
          "name": title || "Sybau Picture Help Center",
          "description": description || "Get help and support for using Sybau Picture AI",
          "url": url || "https://sybaupicture.com/help",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How to use Sybau Picture AI?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Simply upload your image or enter text, choose your style, and let our AI create stunning Sybau-style images."
              }
            },
            {
              "@type": "Question", 
              "name": "What is Sybau style?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sybau is a creative style that embodies 'Stay Young, Beautiful & Unique' - perfect for creating viral content."
              }
            }
          ]
        }
      
      default:
        return baseData
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  )
}