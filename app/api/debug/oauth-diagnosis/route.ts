import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const env = process.env
    const isProduction = env.NODE_ENV === 'production'
    
    // 全面的OAuth配置诊断
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      isProduction,
      
      // NextAuth基础配置
      nextAuth: {
        hasSecret: !!env.NEXTAUTH_SECRET,
        hasUrl: !!env.NEXTAUTH_URL,
        url: env.NEXTAUTH_URL,
        secretLength: env.NEXTAUTH_SECRET ? env.NEXTAUTH_SECRET.length : 0
      },
      
      // Google OAuth配置详情
      googleOAuth: {
        environment: isProduction ? 'production' : 'development',
        
        // 开发环境配置
        dev: {
          hasClientId: !!env.GOOGLE_CLIENT_ID_DEV,
          hasClientSecret: !!env.GOOGLE_CLIENT_SECRET_DEV,
          clientIdPrefix: env.GOOGLE_CLIENT_ID_DEV ? env.GOOGLE_CLIENT_ID_DEV.substring(0, 10) + '...' : 'missing'
        },
        
        // 生产环境配置
        prod: {
          hasClientId: !!env.GOOGLE_CLIENT_ID_PROD,
          hasClientSecret: !!env.GOOGLE_CLIENT_SECRET_PROD,
          clientIdPrefix: env.GOOGLE_CLIENT_ID_PROD ? env.GOOGLE_CLIENT_ID_PROD.substring(0, 10) + '...' : 'missing'
        },
        
        // 通用配置
        generic: {
          hasClientId: !!env.GOOGLE_CLIENT_ID,
          hasClientSecret: !!env.GOOGLE_CLIENT_SECRET,
          clientIdPrefix: env.GOOGLE_CLIENT_ID ? env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'missing'
        },
        
        // 当前激活的配置
        active: {
          clientId: isProduction 
            ? (env.GOOGLE_CLIENT_ID_PROD || env.GOOGLE_CLIENT_ID)
            : (env.GOOGLE_CLIENT_ID_DEV || env.GOOGLE_CLIENT_ID),
          clientSecret: isProduction
            ? (env.GOOGLE_CLIENT_SECRET_PROD || env.GOOGLE_CLIENT_SECRET)
            : (env.GOOGLE_CLIENT_SECRET_DEV || env.GOOGLE_CLIENT_SECRET)
        }
      },
      
      // URL配置验证
      urlConfig: {
        nextAuthUrl: env.NEXTAUTH_URL,
        baseUrl: env.NEXT_PUBLIC_BASE_URL,
        
        // 推导的OAuth回调URL
        callbackUrls: {
          expected: env.NEXTAUTH_URL ? `${env.NEXTAUTH_URL}/api/auth/callback/google` : 'NEXTAUTH_URL not set',
          alternative: env.NEXT_PUBLIC_BASE_URL ? `${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google` : 'BASE_URL not set'
        }
      },
      
      // 数据库配置
      database: {
        hasUrl: !!env.DATABASE_URL,
        urlPrefix: env.DATABASE_URL ? env.DATABASE_URL.substring(0, 20) + '...' : 'missing'
      },
      
      // 配置问题检查
      issues: [] as string[],
      recommendations: [] as string[]
    }
    
    // 检查配置问题
    if (!diagnosis.nextAuth.hasSecret) {
      diagnosis.issues.push('NEXTAUTH_SECRET is missing')
      diagnosis.recommendations.push('Set NEXTAUTH_SECRET environment variable')
    }
    
    if (!diagnosis.nextAuth.hasUrl) {
      diagnosis.issues.push('NEXTAUTH_URL is missing')
      diagnosis.recommendations.push('Set NEXTAUTH_URL to your domain (e.g., https://sybaupicture.com)')
    }
    
    if (!diagnosis.googleOAuth.active.clientId) {
      diagnosis.issues.push(`Google Client ID missing for ${isProduction ? 'production' : 'development'}`)
      diagnosis.recommendations.push(`Set GOOGLE_CLIENT_ID${isProduction ? '_PROD' : '_DEV'} environment variable`)
    }
    
    if (!diagnosis.googleOAuth.active.clientSecret) {
      diagnosis.issues.push(`Google Client Secret missing for ${isProduction ? 'production' : 'development'}`)
      diagnosis.recommendations.push(`Set GOOGLE_CLIENT_SECRET${isProduction ? '_PROD' : '_DEV'} environment variable`)
    }
    
    if (!diagnosis.database.hasUrl) {
      diagnosis.issues.push('DATABASE_URL is missing')
      diagnosis.recommendations.push('Set DATABASE_URL environment variable')
    }
    
    // URL配置验证
    if (diagnosis.nextAuth.url && !diagnosis.nextAuth.url.startsWith('https://')) {
      diagnosis.issues.push('NEXTAUTH_URL should use HTTPS in production')
      diagnosis.recommendations.push('Update NEXTAUTH_URL to use HTTPS protocol')
    }
    
    // 添加配置状态总结
    const configStatus = {
      critical: diagnosis.issues.filter(issue => 
        issue.includes('missing') || issue.includes('NEXTAUTH_SECRET') || issue.includes('Client ID')
      ).length,
      warnings: diagnosis.issues.length - diagnosis.issues.filter(issue => 
        issue.includes('missing') || issue.includes('NEXTAUTH_SECRET') || issue.includes('Client ID')
      ).length,
      overall: diagnosis.issues.length === 0 ? 'healthy' : 
               diagnosis.issues.filter(i => i.includes('missing')).length > 0 ? 'critical' : 'warning'
    }
    
    return NextResponse.json({
      ...diagnosis,
      configStatus,
      summary: {
        totalIssues: diagnosis.issues.length,
        criticalIssues: configStatus.critical,
        recommendations: diagnosis.recommendations.length,
        status: configStatus.overall
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to diagnose OAuth configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}