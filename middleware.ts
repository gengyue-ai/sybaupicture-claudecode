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
  const hostname = request.nextUrl.hostname

  // 跳过API路由、静态文件和Next.js内部路由
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/ads.txt' ||
    pathname.includes('.') && !pathname.startsWith('/zh/') && !pathname.startsWith('/en/')
  ) {
    return NextResponse.next()
  }

  // 🎯 处理gallery二级域名 - 将 gallery.sybaupicture.com 重写到 /gallery
  // 使用includes检查，以防有端口号
  if (hostname.includes('gallery.sybaupicture.com')) {
    console.log('🎯 检测到gallery二级域名，hostname:', hostname, 'pathname:', pathname)
    // 重写URL到gallery页面
    const url = request.nextUrl.clone()
    // 根路径 / 重定向到 /gallery，其他路径加上 /gallery 前缀
    if (pathname === '/' || pathname === '') {
      url.pathname = '/gallery'
    } else {
      url.pathname = '/gallery'
    }
    console.log('🔄 rewrite到:', url.pathname)
    return NextResponse.rewrite(url)
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
