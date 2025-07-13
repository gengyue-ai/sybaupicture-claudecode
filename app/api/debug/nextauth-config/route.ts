import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // 安全地显示NextAuth配置（隐藏敏感信息）
    const config = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // 基础配置
      nextAuth: {
        url: process.env.NEXTAUTH_URL,
        secret: process.env.NEXTAUTH_SECRET ? '***配置正确***' : '❌ 未配置',
        secretLength: process.env.NEXTAUTH_SECRET?.length || 0
      },
      
      // 提供商配置
      providers: authOptions.providers.map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type
      })),
      
      // 页面配置
      pages: authOptions.pages,
      
      // Session配置
      session: authOptions.session,
      
      // 回调配置状态
      callbacks: {
        hasJWT: !!authOptions.callbacks?.jwt,
        hasSession: !!authOptions.callbacks?.session,
        hasRedirect: !!authOptions.callbacks?.redirect
      },
      
      // 调试模式
      debug: authOptions.debug,
      
      // 环境变量状态
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        
        // Google OAuth状态
        googleOAuth: {
          hasClientId: !!(process.env.GOOGLE_CLIENT_ID_PROD || process.env.GOOGLE_CLIENT_ID),
          hasClientSecret: !!(process.env.GOOGLE_CLIENT_SECRET_PROD || process.env.GOOGLE_CLIENT_SECRET),
          clientIdPreview: (process.env.GOOGLE_CLIENT_ID_PROD || process.env.GOOGLE_CLIENT_ID)?.substring(0, 12) + '...'
        }
      },
      
      // URL构建测试
      urlTest: {
        baseUrl: process.env.NEXTAUTH_URL || 'undefined',
        expectedCallback: (process.env.NEXTAUTH_URL || 'undefined') + '/api/auth/callback/google',
        hasNewlines: !!(process.env.NEXTAUTH_URL?.includes('\n') || process.env.NEXT_PUBLIC_BASE_URL?.includes('\n'))
      }
    }
    
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to analyze NextAuth config',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}