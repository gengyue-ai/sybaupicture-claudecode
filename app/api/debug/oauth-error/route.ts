import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const errorType = searchParams.get('error') || 'unknown'
    
    // 分析不同类型的OAuth错误
    const errorAnalysis = analyzeOAuthError(errorType)
    
    // 检查环境配置
    const envCheck = checkEnvironmentConfig()
    
    // 获取当前时间和URL信息
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      error: errorType,
      requestUrl: request.url,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      errorAnalysis,
      environmentCheck: envCheck,
      oauthParams: {
        clientIdConfigured: envCheck.googleConfig.hasClientId,
        secretConfigured: envCheck.googleConfig.hasClientSecret,
        nextAuthUrl: envCheck.urls.nextAuthUrl,
        baseUrl: envCheck.urls.baseUrl
      },
      cookies: {
        total: request.headers.get('cookie')?.split(';').length || 0,
        nextAuthCookies: (request.headers.get('cookie') || '').includes('next-auth') ? 'present' : 'missing'
      }
    }
    
    return NextResponse.json(diagnosticInfo)
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to analyze OAuth error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function analyzeOAuthError(errorType: string) {
  const errorMap: Record<string, {
    type: string
    description: string
    severity: 'high' | 'medium' | 'low'
    possibleCauses: string[]
    solutions: string[]
  }> = {
    'OAuthCallback': {
      type: 'OAuth回调失败',
      description: 'Google OAuth回调处理过程中发生错误',
      severity: 'high',
      possibleCauses: [
        'Google OAuth客户端ID或密钥配置错误',
        'OAuth回调URL在Google Console中未正确配置',
        'JWT回调函数中的异步操作失败',
        '数据库连接问题导致用户创建失败',
        'NextAuth.js配置错误'
      ],
      solutions: [
        '检查Google OAuth配置环境变量',
        '验证Google Console中的授权回调URI',
        '检查数据库连接状态',
        '查看服务器日志获取详细错误信息',
        '尝试重新配置OAuth应用'
      ]
    },
    'Configuration': {
      type: '配置错误',
      description: 'NextAuth或OAuth配置不完整',
      severity: 'high',
      possibleCauses: [
        'NEXTAUTH_SECRET未设置',
        'NEXTAUTH_URL配置错误',
        'Google OAuth凭据缺失',
        '环境变量命名错误'
      ],
      solutions: [
        '检查所有必需的环境变量',
        '验证NEXTAUTH_URL与实际域名匹配',
        '确认Google OAuth凭据正确',
        '重新部署应用程序'
      ]
    },
    'AccessDenied': {
      type: '访问被拒绝',
      description: '用户拒绝了OAuth授权',
      severity: 'low',
      possibleCauses: [
        '用户取消了Google授权',
        '用户账户权限不足',
        'OAuth范围配置过于严格'
      ],
      solutions: [
        '重新尝试登录',
        '检查用户Google账户状态',
        '调整OAuth权限范围'
      ]
    }
  }
  
  return errorMap[errorType] || {
    type: '未知错误',
    description: '发生了未分类的认证错误',
    severity: 'medium' as const,
    possibleCauses: ['网络连接问题', '临时服务不可用', '浏览器Cookie问题'],
    solutions: ['刷新页面重试', '清除浏览器Cookie', '检查网络连接']
  }
}

function checkEnvironmentConfig() {
  const env = process.env
  const isProduction = env.NODE_ENV === 'production'
  
  return {
    environment: env.NODE_ENV,
    isProduction,
    
    // 基础配置检查
    hasNextAuthUrl: !!env.NEXTAUTH_URL,
    hasNextAuthSecret: !!env.NEXTAUTH_SECRET,
    hasDatabase: !!env.DATABASE_URL,
    
    // Google OAuth配置检查
    googleConfig: {
      hasClientId: isProduction 
        ? !!(env.GOOGLE_CLIENT_ID_PROD || env.GOOGLE_CLIENT_ID)
        : !!(env.GOOGLE_CLIENT_ID_DEV || env.GOOGLE_CLIENT_ID),
      hasClientSecret: isProduction
        ? !!(env.GOOGLE_CLIENT_SECRET_PROD || env.GOOGLE_CLIENT_SECRET)
        : !!(env.GOOGLE_CLIENT_SECRET_DEV || env.GOOGLE_CLIENT_SECRET),
      activeConfig: isProduction ? 'PROD' : 'DEV'
    },
    
    // URL配置
    urls: {
      nextAuthUrl: env.NEXTAUTH_URL,
      baseUrl: env.NEXT_PUBLIC_BASE_URL || 'not_configured'
    }
  }
}