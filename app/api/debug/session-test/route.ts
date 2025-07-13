import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  console.log('🔍 会话测试API被调用')
  
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions)
    
    // 获取cookie信息（不直接使用headers）
    const cookieHeader = request.headers.get('cookie')
    const cookies = request.cookies.getAll()
    const nextAuthCookies = cookies.filter(cookie => 
      cookie.name.startsWith('next-auth') || 
      cookie.name.startsWith('__Secure-next-auth')
    )
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      sessionStatus: session ? '已登录' : '未登录',
      session: session ? {
        user: {
          id: (session.user as any)?.id,
          email: session.user?.email,
          name: session.user?.name,
          image: session.user?.image,
          planName: (session.user as any)?.planName,
          isSubscribed: (session.user as any)?.isSubscribed,
          needsDataSync: (session.user as any)?.needsDataSync
        }
      } : null,
      cookies: {
        total: cookies.length,
        nextAuthCookies: nextAuthCookies.length,
        cookieNames: nextAuthCookies.map(c => c.name),
        hasCookies: cookieHeader ? true : false
      },
      currentUrl: request.url,
      nextAuthConfig: {
        secret: process.env.NEXTAUTH_SECRET ? '已设置' : '未设置',
        googleClientId: process.env.GOOGLE_CLIENT_ID ? '已设置' : '未设置',
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? '已设置' : '未设置',
        nextAuthUrl: process.env.NEXTAUTH_URL || '未设置'
      }
    }
    
    console.log('🔍 会话测试结果:', debugInfo)
    
    return NextResponse.json(debugInfo, { status: 200 })
    
  } catch (error) {
    console.error('❌ 会话测试出错:', error)
    
    return NextResponse.json({
      error: '会话测试失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 标记为动态路由
export const dynamic = 'force-dynamic' 