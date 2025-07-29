import { MetadataRoute } from 'next'

const SITE_URL = 'https://sybaupicture.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = []

  // 静态页面 - 统一更新时间
  const lastModified = new Date()
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: lastModified,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    // 新增页面 - 用户相关
    {
      url: `${SITE_URL}/profile/assets`,
      lastModified: lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/billing`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/history`,
      lastModified: lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    // 法律页面
    {
      url: `${SITE_URL}/privacy`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ]

  sitemap.push(...staticPages)

  try {
    // 多语言页面（只支持中文和英文）
    const languages = ['zh'] // 只保留中文

    for (const lang of languages) {
      // 主页多语言版本
      sitemap.push({
        url: `${SITE_URL}/${lang}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })

      // 重要页面多语言版本（包含用户相关页面）
      const i18nPages = ['gallery', 'pricing', 'help', 'support', 'contact', 'privacy', 'terms', 'profile/assets', 'billing']
      i18nPages.forEach(page => {
        const priority = page === 'gallery' ? 0.7 :
          page === 'pricing' ? 0.8 :
            ['help', 'support'].includes(page) ? 0.5 :
              ['profile/assets', 'billing'].includes(page) ? 0.6 :
                ['contact'].includes(page) ? 0.4 : 0.3

        sitemap.push({
          url: `${SITE_URL}/${lang}/${page}`,
          lastModified: new Date(),
          changeFrequency: ['gallery', 'pricing'].includes(page) ? 'weekly' : 'monthly',
          priority: priority,
        })
      })
    }

  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return sitemap
}
