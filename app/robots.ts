import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/generator',
          '/gallery',
          '/blog',
          '/about',
          '/api/og/*', // 允许访问OG图片API
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