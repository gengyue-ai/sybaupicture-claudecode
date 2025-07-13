import { NextResponse } from 'next/server'

export async function GET() {
  // 基础环境信息
  const env = process.env
  const isProduction = env.NODE_ENV === 'production'
  
  // 安全地检查关键配置（不暴露实际值）
  const authStatus = {
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    
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
      activeClientId: isProduction ? 'PROD' : 'DEV'
    },
    
    // URL配置
    urls: {
      nextAuthUrl: env.NEXTAUTH_URL,
      baseUrl: env.NEXT_PUBLIC_BASE_URL || 'not_set'
    },
    
    // 简化的问题检查
    issues: []
  }
  
  // 检查潜在问题
  if (!authStatus.hasNextAuthUrl) {
    authStatus.issues.push('NEXTAUTH_URL not configured')
  }
  if (!authStatus.hasNextAuthSecret) {
    authStatus.issues.push('NEXTAUTH_SECRET not configured')
  }
  if (!authStatus.googleConfig.hasClientId) {
    authStatus.issues.push('Google Client ID not configured for ' + (isProduction ? 'production' : 'development'))
  }
  if (!authStatus.googleConfig.hasClientSecret) {
    authStatus.issues.push('Google Client Secret not configured for ' + (isProduction ? 'production' : 'development'))
  }
  
  return NextResponse.json(authStatus)
}