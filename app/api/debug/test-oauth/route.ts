import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET() {
  try {
    // 测试OAuth配置和环境
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // 环境变量检查
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NODE_ENV: process.env.NODE_ENV,
      },
      
      // config.ts导入的配置
      config: {
        appUrl: config.app.url,
        googleClientId: config.auth.google.clientId ? config.auth.google.clientId.substring(0, 10) + '...' : 'missing',
        googleClientSecret: !!config.auth.google.clientSecret,
      },
      
      // NextAuth相关URL测试
      authUrls: {
        signin: `${config.app.url}/api/auth/signin/google`,
        callback: `${config.app.url}/api/auth/callback/google`,
        providers: `${config.app.url}/api/auth/providers`,
      },
      
      // OAuth流程测试
      oauthTest: {
        expectedRedirect: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.auth.google.clientId}&redirect_uri=${encodeURIComponent(config.app.url + '/api/auth/callback/google')}&scope=${encodeURIComponent('openid email profile')}&response_type=code`,
      }
    }
    
    return NextResponse.json(testResults)
    
  } catch (error) {
    return NextResponse.json({
      error: 'OAuth test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}