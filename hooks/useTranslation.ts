'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  extractLanguageFromPath,
  DEFAULT_LANGUAGE,
  fallbackTranslations,
  type SupportedLanguage
} from '@/lib/i18n'

export function useTranslation(pagePath: string = '/') {
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const pathname = usePathname()

  // 检测当前语言
  useEffect(() => {
    const { language } = extractLanguageFromPath(pathname)
    setCurrentLanguage(language)
  }, [pathname])

  // 加载翻译
  useEffect(() => {
    let isMounted = true

    function loadTranslations() {
      if (!isMounted) return

      try {
        setIsLoading(true)

        // 直接使用备用翻译数据
        const translationData = fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.[currentLanguage] ||
                               fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.['en'] ||
                               null

        if (isMounted) {
          if (translationData && typeof translationData === 'object') {
            setTranslations(translationData)
          } else {
            // 如果翻译数据无效，设置为空对象，依赖fallback
            setTranslations({})
            console.warn(`No valid translation data for ${pagePath} in ${currentLanguage}`)
          }
        }
      } catch (error) {
        console.error('Error loading translations:', error)
        if (isMounted) {
          setTranslations({})
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // 直接加载翻译数据（不再需要异步）
    loadTranslations()

    return () => {
      isMounted = false
    }
  }, [pagePath, currentLanguage])

  // 安全的翻译函数
  const t = (key: string, fallback?: string): string => {
    try {
      if (!key) return fallback || ''

      // 分割嵌套键 (如 'nav.about')
      const keys = key.split('.')
      let current: any = translations

      // 遍历嵌套对象
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k]
        } else {
          current = undefined
          break
        }
      }

      // 检查结果是否有效
      if (current && typeof current === 'string' && current.length > 0) {
        // 简化的乱码检测 - 只检查是否为空或纯特殊符号
        const hasValidChars = current.trim().length > 0 && !/^[\s\u0000-\u001f\u007f-\u009f]*$/.test(current)

        if (hasValidChars) {
          return current
        } else {
          console.warn(`Detected invalid characters in translation for key "${key}": "${current}"`)
        }
      }

      // 如果翻译失败或包含乱码，返回fallback
      return fallback || key
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error)
      return fallback || key
    }
  }

  return {
    t,
    isLoading,
    currentLanguage,
    hasTranslations: Object.keys(translations).length > 0
  }
}

// 用于服务端组件的翻译函数
export async function getServerTranslation(pagePath: string, language: SupportedLanguage) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/translations?pagePath=${encodeURIComponent(pagePath)}&langCode=${language}`,
      {
        cache: 'force-cache',
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.success ? result.data : {}
  } catch (error) {
    console.error('Server translation error:', error)
    return {}
  }
}
