import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*', 
          '/private/',
          '/_next/',
          '/auth/',
        ],
      },
      // 阻止AI训练爬虫但允许搜索引擎
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
      {
        userAgent: 'Bytespider',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
      {
        userAgent: 'Amazonbot',
        disallow: ['/'],
      },
      {
        userAgent: 'Applebot-Extended',
        disallow: ['/'],
      },
      {
        userAgent: 'meta-externalagent',
        disallow: ['/'],
      },
      {
        userAgent: 'ClaudeBot',
        disallow: ['/'],
      },
    ],
    sitemap: 'https://sybaupicture.com/sitemap.xml',
    host: 'https://sybaupicture.com',
  }
} 