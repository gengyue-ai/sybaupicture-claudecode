import { MetadataRoute } from 'next'

const SITE_URL = 'https://sybaupicture.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = []

  // 静态页面
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
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

      // 画廊多语言版本
      sitemap.push({
        url: `${SITE_URL}/${lang}/gallery`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      })
    }

  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return sitemap
}
