import { Metadata } from 'next'
import HelpPageClient from './HelpPageClient'

export const metadata: Metadata = {
  title: 'Help & Support - Sybau Picture | AI Image Generator FAQ',
  description: 'Find answers to frequently asked questions about Sybau Picture AI image generator. Get help with image generation, pricing, troubleshooting, and more.',
  keywords: ['help', 'support', 'FAQ', 'AI image generator', 'Sybau Picture', 'troubleshooting', 'guide', 'tutorial'],
  openGraph: {
    title: 'Help & Support - Sybau Picture',
    description: 'Find answers to frequently asked questions about Sybau Picture AI image generator. Get help with image generation, pricing, troubleshooting, and more.',
    url: 'https://sybaupicture.com/help',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Help & Support - Sybau Picture',
    description: 'Find answers to frequently asked questions about Sybau Picture AI image generator.',
  },
  alternates: {
    canonical: '/help',
    languages: {
      'en-US': '/help',
      'zh-CN': '/zh/help',
    },
  },
}

export default function HelpPage() {
  return (
    <>
      {/* FAQ结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does the AI image generator work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our AI uses advanced machine learning models inspired by Gen Z culture and the Sybau philosophy - Stay Young, Beautiful and Unique. Simply upload an image or enter text, select your preferred style, and our AI will transform it into a viral-worthy creative piece in seconds."
                }
              },
              {
                "@type": "Question", 
                "name": "What image formats are supported?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We support all major image formats including JPG, PNG, GIF, and WebP. For best results, we recommend uploading high-quality images with good lighting and clear subjects."
                }
              },
              {
                "@type": "Question",
                "name": "How many images can I generate?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Free users can generate 3 images per month. Standard users get 50 images per month, and PRO users get 200 images per month with priority processing."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use generated images commercially?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! All images generated with Sybau Picture can be used for commercial purposes. You retain full rights to your creations. However, please ensure your original uploaded images don't infringe on copyrights."
                }
              }
            ]
          })
        }}
      />
      <HelpPageClient />
    </>
  )
}