import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/gallery',
          '/pricing',
          '/help',
          '/support',
          '/contact',
          '/privacy',
          '/terms',
          '/zh/',
          '/zh/gallery',
          '/zh/pricing',
          '/zh/help',
          '/zh/support',
          '/zh/contact',
          '/zh/privacy',
          '/zh/terms',
        ],
        disallow: [
          '/api/*',
          '/admin/*',
          '/private/',
          '/_next/',
          '/auth/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],
      },
    ],
    sitemap: 'https://sybaupicture.com/sitemap.xml',
    host: 'https://sybaupicture.com',
  }
} 