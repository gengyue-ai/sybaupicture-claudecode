import { NextResponse } from 'next/server'

export async function GET() {
  // 只在开发环境或具有DEBUG权限时显示
  const isDebugAllowed = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true'
  
  if (!isDebugAllowed) {
    return NextResponse.json({ error: 'Debug endpoint not available' }, { status: 404 })
  }

  const env = process.env
  const isProduction = env.NODE_ENV === 'production'

  // 安全地显示环境变量状态（不显示实际值）
  const envStatus = {
    NODE_ENV: env.NODE_ENV,
    isProduction,
    
    // 基础配置
    NEXTAUTH_URL: env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!env.NEXTAUTH_SECRET,
    DATABASE_URL: !!env.DATABASE_URL,
    
    // Google OAuth
    GOOGLE_CLIENT_ID: !!env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_ID_DEV: !!env.GOOGLE_CLIENT_ID_DEV,
    GOOGLE_CLIENT_ID_PROD: !!env.GOOGLE_CLIENT_ID_PROD,
    GOOGLE_CLIENT_SECRET: !!env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_SECRET_DEV: !!env.GOOGLE_CLIENT_SECRET_DEV,
    GOOGLE_CLIENT_SECRET_PROD: !!env.GOOGLE_CLIENT_SECRET_PROD,
    
    // Stripe配置
    STRIPE_SECRET_KEY: !!env.STRIPE_SECRET_KEY,
    STRIPE_SECRET_KEY_DEV: !!env.STRIPE_SECRET_KEY_DEV,
    STRIPE_SECRET_KEY_PROD: !!env.STRIPE_SECRET_KEY_PROD,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV: !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD: !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD,
    STRIPE_WEBHOOK_SECRET: !!env.STRIPE_WEBHOOK_SECRET,
    STRIPE_WEBHOOK_SECRET_DEV: !!env.STRIPE_WEBHOOK_SECRET_DEV,
    STRIPE_WEBHOOK_SECRET_PROD: !!env.STRIPE_WEBHOOK_SECRET_PROD,
    
    // AI服务
    FAL_KEY: !!env.FAL_KEY,
    
    // AdSense
    NEXT_PUBLIC_GOOGLE_ADSENSE_ID: !!env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID,
  }

  // 计算当前使用的配置
  const activeConfig = {
    stripe: {
      secretKey: isProduction 
        ? !!(env.STRIPE_SECRET_KEY_PROD || env.STRIPE_SECRET_KEY)
        : !!(env.STRIPE_SECRET_KEY_DEV || env.STRIPE_SECRET_KEY),
      publicKey: isProduction
        ? !!(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD || env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
        : !!(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV || env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      webhookSecret: isProduction
        ? !!(env.STRIPE_WEBHOOK_SECRET_PROD || env.STRIPE_WEBHOOK_SECRET)
        : !!(env.STRIPE_WEBHOOK_SECRET_DEV || env.STRIPE_WEBHOOK_SECRET),
    },
    google: {
      clientId: isProduction
        ? !!(env.GOOGLE_CLIENT_ID_PROD || env.GOOGLE_CLIENT_ID)
        : !!(env.GOOGLE_CLIENT_ID_DEV || env.GOOGLE_CLIENT_ID),
      clientSecret: isProduction
        ? !!(env.GOOGLE_CLIENT_SECRET_PROD || env.GOOGLE_CLIENT_SECRET)
        : !!(env.GOOGLE_CLIENT_SECRET_DEV || env.GOOGLE_CLIENT_SECRET),
    }
  }

  return NextResponse.json({
    environment: isProduction ? 'production' : 'development',
    envStatus,
    activeConfig,
    recommendations: {
      stripe: !activeConfig.stripe.secretKey ? 'Configure STRIPE_SECRET_KEY' : 'OK',
      google: !activeConfig.google.clientId ? 'Configure GOOGLE_CLIENT_ID' : 'OK',
      database: !envStatus.DATABASE_URL ? 'Configure DATABASE_URL' : 'OK',
      ai: !envStatus.FAL_KEY ? 'Configure FAL_KEY' : 'OK',
    }
  })
}