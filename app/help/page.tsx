import { Metadata } from 'next'
import HelpPageClient from './HelpPageClient'

export const metadata: Metadata = {
  title: 'Help & Support - Sybau Picture | AI Image Generator FAQ & Templates',
  description: 'Find comprehensive answers about Sybau Picture AI image generator. Learn about templates, My Assets, dual modes, pricing plans, troubleshooting, and advanced features.',
  keywords: ['help', 'support', 'FAQ', 'AI image generator', 'Sybau Picture', 'templates', 'my assets', 'text-to-image', 'image-to-image', 'troubleshooting', 'guide', 'tutorial', 'watermark removal', 'body optimization'],
  openGraph: {
    title: 'Help & Support - Sybau Picture AI Generator',
    description: 'Complete FAQ guide for Sybau Picture: Templates, My Assets, dual creation modes, pricing plans, and troubleshooting. Master AI image generation.',
    url: 'https://sybaupicture.com/help',
    type: 'website',
    images: [{
      url: 'https://sybaupicture.com/images/help-og.jpg',
      width: 1200,
      height: 630,
      alt: 'Sybau Picture Help & Support Guide',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help & Support - Sybau Picture',
    description: 'Complete FAQ guide: Templates, My Assets, dual modes, and advanced AI image generation features.',
    images: ['https://sybaupicture.com/images/help-twitter.jpg'],
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
      {/* 更新的FAQ结构化数据 */}
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
                  "text": "Our AI uses advanced machine learning models inspired by Gen Z culture and the Sybau philosophy - Stay Young, Beautiful and Unique. Choose between Text-to-Image mode (enter a description) or Image-to-Image mode (upload and transform), select your style, and get professional results in seconds."
                }
              },
              {
                "@type": "Question",
                "name": "What are Templates and how do I use them?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Templates are pre-configured AI setups for specific tasks like watermark removal, body optimization, or background replacement. Click the template library button to browse 14 professional templates across 3 categories: Life Enhancement, Business Creation, and Creative Conversion."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between Text-to-Image and Image-to-Image modes?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Text-to-Image creates completely new images from your written description. Image-to-Image transforms your uploaded photos using AI - perfect for editing, style changes, or enhancements. Both modes support our 4 professional styles."
                }
              },
              {
                "@type": "Question",
                "name": "How do I manage my generated images?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Visit 'My Assets' in your profile to view all generated images, organized by date. You can view, download, or delete images from your personal gallery. Images are automatically saved when you generate them."
                }
              },
              {
                "@type": "Question", 
                "name": "What image formats are supported?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We support JPG, PNG, and WebP formats. Images should be under 5MB for optimal processing. Resolution between 512x512 and 2048x2048 pixels works best."
                }
              },
              {
                "@type": "Question",
                "name": "What are the current usage limits?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Free users: 3 images per month. Standard users: 60 images per month. Pro users: 180 images per month with priority processing. All plans include unlimited storage and no watermarks."
                }
              },
              {
                "@type": "Question",
                "name": "Which templates are available for free users?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "🎉 MAJOR UPDATE: All 14 professional templates are now FREE for all users! Choose from 3 categories: Life Enhancement (watermark removal, body optimization, tourist removal), Business Creation (e-commerce displays, background replacement, element integration), and Creative Conversion (style conversion, text editing, detail modification). No restrictions - enjoy full access to our FLUX Pro powered template library!"
                }
              },
              {
                "@type": "Question", 
                "name": "What's new with the template system upgrade?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "🚀 MAJOR FEATURE UPGRADE: We've completely opened our template library! All 14 professional templates powered by FLUX Pro engine are now FREE for everyone. Experience Life Enhancement templates (smart editing), Business Creation templates (e-commerce ready), and Creative Conversion templates (artistic transformation). Each template includes optimized parameters for 15-second professional results. No more restrictions - create unlimited professional content!"
                }
              },
              {
                "@type": "Question",
                "name": "What are the different AI styles available?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We offer 4 professional AI styles: 🎨 Classic - Traditional balanced aesthetic for everyday use; 💼 Professional - Refined business-ready style for commercial projects; 🌟 Exaggerated/Expressive - Bold and dramatic style (Standard plan+); 🎭 Creative - Imaginative artistic style for unique expressions. Each style is optimized for different use cases and creative needs."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use generated images commercially?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! You retain full commercial rights to all generated images. Use them for business, social media, marketing, or any commercial purpose. Just ensure your original uploaded images don't infringe on copyrights."
                }
              },
              {
                "@type": "Question",
                "name": "Do you add watermarks to generated images?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No! All plans, including the free tier, generate images without watermarks. You get clean, professional results ready for any use case."
                }
              },
              {
                "@type": "Question",
                "name": "How long are my images stored?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your generated images are stored permanently in your account unless you delete them. You have unlimited storage for your creations and can access them anytime from 'My Assets'."
                }
              },
              {
                "@type": "Question",
                "name": "Is my data safe and private?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely. We use enterprise-grade encryption and don't store uploaded images permanently unless you choose to save them. Generated images are only kept in your personal gallery. Read our Privacy Policy for complete details."
                }
              },
              {
                "@type": "Question",
                "name": "How do I get the best results with templates?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "🎯 For optimal template results: 1) Choose the right category - Life Enhancement for photo editing, Business Creation for commercial use, Creative Conversion for artistic effects; 2) Upload high-quality original images (JPG/PNG, under 5MB); 3) Templates auto-apply optimized FLUX Pro parameters for best results; 4) Combine with appropriate AI styles - Professional for business, Creative for artistic projects; 5) Use specific prompts that match your template's purpose for enhanced accuracy."
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