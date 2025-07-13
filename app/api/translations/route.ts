import { NextRequest, NextResponse } from 'next/server'
import { getTranslation, getAllTranslations } from '@/lib/i18n-server'
import { isValidLanguage } from '@/lib/i18n'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagePath = searchParams.get('pagePath')
    const langCode = searchParams.get('langCode')
    const getAllPages = searchParams.get('all') === 'true'

    if (!langCode || !isValidLanguage(langCode)) {
      return NextResponse.json(
        { error: 'Invalid language code' },
        { status: 400 }
      )
    }

    if (getAllPages) {
      // 获取所有页面的翻译
      const translations = await getAllTranslations(langCode)
      return NextResponse.json({
        success: true,
        data: translations,
        language: langCode
      })
    }

    if (!pagePath) {
      return NextResponse.json(
        { error: 'Page path is required' },
        { status: 400 }
      )
    }

    // 获取单个页面的翻译
    const translation = await getTranslation(pagePath, langCode)

    // 如果没有找到翻译，返回空对象而不是错误
    // 这样客户端可以使用fallback值
    return NextResponse.json({
      success: true,
      data: translation || {},
      language: langCode,
      pagePath
    })

  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
