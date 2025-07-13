import { prisma } from '@/lib/prisma'
import { SupportedLanguage, fallbackTranslations } from '@/lib/i18n'

// 获取翻译内容（仅服务器端）
export async function getTranslation(pagePath: string, langCode: SupportedLanguage) {
  try {
    // 如果数据库不可用，直接使用备用翻译
    if (!prisma) {
      console.warn('⚠️  数据库不可用，使用备用翻译数据')
      return fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.[langCode] ||
             fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.['en'] ||
             null
    }

    const translation = await prisma.translation.findUnique({
      where: {
        pagePath_langCode: {
          pagePath,
          langCode
        }
      },
      select: {
        content: true,
        lastUpdated: true
      }
    })

    if (!translation) {
      // 如果找不到翻译，返回英文版本
      if (langCode !== 'en') {
        return getTranslation(pagePath, 'en')
      }
      // 使用备用翻译数据
      return fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.[langCode] ||
             fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.['en'] ||
             null
    }

    return translation.content
  } catch (error) {
    console.error('Failed to get translation, using fallback:', error)
    // 返回备用翻译数据
    return fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.[langCode] ||
           fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.['en'] ||
           null
  }
}

// 获取所有页面的翻译（仅服务器端）
export async function getAllTranslations(langCode: SupportedLanguage) {
  try {
    // 如果数据库不可用，返回备用翻译
    if (!prisma) {
      console.warn('⚠️  数据库不可用，使用备用翻译数据')
      const translationMap: Record<string, any> = {}
      Object.keys(fallbackTranslations).forEach(pagePath => {
        const translation = fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.[langCode] ||
                           fallbackTranslations[pagePath as keyof typeof fallbackTranslations]?.['en']
        if (translation) {
          translationMap[pagePath] = translation
        }
      })
      return translationMap
    }

    const translations = await prisma.translation.findMany({
      where: {
        langCode,
        isActive: true
      },
      select: {
        pagePath: true,
        content: true
      }
    })

    const translationMap: Record<string, any> = {}
    translations.forEach(t => {
      translationMap[t.pagePath] = t.content
    })

    return translationMap
  } catch (error) {
    console.error('Failed to get all translations:', error)
    return {}
  }
}

// 保存翻译（仅服务器端）
export async function saveTranslation(
  pagePath: string,
  langCode: SupportedLanguage,
  content: any
) {
  try {
    // 如果数据库不可用，跳过保存
    if (!prisma) {
      console.warn('⚠️  数据库不可用，跳过翻译保存')
      return false
    }

    await prisma.translation.upsert({
      where: {
        pagePath_langCode: {
          pagePath,
          langCode
        }
      },
      update: {
        content,
        lastUpdated: new Date(),
        isActive: true
      },
      create: {
        pagePath,
        langCode,
        content,
        isActive: true
      }
    })
    return true
  } catch (error) {
    console.error('Failed to save translation:', error)
    return false
  }
}
