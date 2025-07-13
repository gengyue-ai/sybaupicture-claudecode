import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'zh']
const defaultLocale = 'en'

// 获取当前URL的语言
function getCurrentLocale(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && locales.includes(segments[0])) {
    return segments[0]
  }
  return null
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 跳过API路由、静态文件和Next.js内部路由
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  const currentLocale = getCurrentLocale(pathname)

  // 如果URL已经包含语言代码，直接继续
  if (currentLocale) {
    return NextResponse.next()
  }

  // 对于没有语言前缀的路径，默认显示英文版本
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
