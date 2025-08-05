'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function MultiLanguageMeta() {
  const pathname = usePathname()

  useEffect(() => {
    // 清理现有的hreflang标签
    const existingHreflangs = document.querySelectorAll('link[hreflang]')
    existingHreflangs.forEach(link => link.remove())

    // 确定当前是中文还是英文页面
    const isChinesePage = pathname.startsWith('/zh')
    const basePathname = isChinesePage ? pathname.replace('/zh', '') || '/' : pathname
    
    // 生成对应的URL
    const englishUrl = `https://sybaupicture.com${basePathname}`
    const chineseUrl = `https://sybaupicture.com/zh${basePathname === '/' ? '' : basePathname}`
    
    // 添加hreflang标签
    const hreflangs = [
      { lang: 'en', url: englishUrl },
      { lang: 'zh-CN', url: chineseUrl },
      { lang: 'x-default', url: englishUrl } // 默认语言为英文
    ]

    hreflangs.forEach(({ lang, url }) => {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = lang
      link.href = url
      document.head.appendChild(link)
    })

    console.log('🌍 Hreflang tags added:', {
      current: pathname,
      isChinesePage,
      englishUrl,
      chineseUrl
    })
  }, [pathname])

  return null
}