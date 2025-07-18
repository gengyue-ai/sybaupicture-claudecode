import { NextResponse } from 'next/server'

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
    
    // 检查环境变量存在性
    has_google_client_id: !!googleClientId,
    has_google_client_secret: !!googleClientSecret,
    has_nextauth_secret: !!nextAuthSecret,
    has_nextauth_url: !!nextAuthUrl,
    
    // 检查长度（但不暴露实际值）
    google_client_id_length: googleClientId?.length || 0,
    google_client_secret_length: googleClientSecret?.length || 0,
    nextauth_secret_length: nextAuthSecret?.length || 0,
    
    // 检查前缀
    google_client_id_prefix: googleClientId?.substring(0, 12) || 'missing',
    google_client_secret_prefix: googleClientSecret?.substring(0, 7) || 'missing',
    
    // URL配置
    nextauth_url: nextAuthUrl,
    expected_callback: `${nextAuthUrl}/api/auth/callback/google`,
    
    // 检查是否有特殊字符
    google_client_id_has_newline: googleClientId?.includes('\n') || false,
    google_client_secret_has_newline: googleClientSecret?.includes('\n') || false,
  })
}