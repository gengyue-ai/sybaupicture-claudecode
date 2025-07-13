// 🔧 Sybau Picture - 简化配置管理
// 保护AdSense：保留所有广告相关环境变量支持

const isProduction = process.env.NODE_ENV === 'production'

export const config = {
  app: {
    name: 'Sybau Picture',
    description: 'AI-powered image generation platform',
    url: isProduction 
      ? process.env.NEXTAUTH_URL || 'https://sybaupicture.com'
      : 'http://localhost:3001',
  },
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    google: {
      clientId: isProduction 
        ? process.env.GOOGLE_CLIENT_ID_PROD!
        : (process.env.GOOGLE_CLIENT_ID_DEV || process.env.GOOGLE_CLIENT_ID)!,
      clientSecret: isProduction 
        ? process.env.GOOGLE_CLIENT_SECRET_PROD!
        : (process.env.GOOGLE_CLIENT_SECRET_DEV || process.env.GOOGLE_CLIENT_SECRET)!,
    },
  },
  
  ai: {
    falKey: process.env.FAL_KEY!,
  },
  
  stripe: {
    secretKey: isProduction
      ? process.env.STRIPE_SECRET_KEY_PROD!
      : (process.env.STRIPE_SECRET_KEY_DEV || process.env.STRIPE_SECRET_KEY)!,
    publicKey: isProduction
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD!
      : (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)!,
    webhookSecret: isProduction
      ? process.env.STRIPE_WEBHOOK_SECRET_PROD!
      : (process.env.STRIPE_WEBHOOK_SECRET_DEV || process.env.STRIPE_WEBHOOK_SECRET)!,
  },
  
  // 🔒 AdSense配置 - 完全保护不修改
  ads: {
    googleAdSenseId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID,
    ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    googleAdsConversionId: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
  },
  
  email: {
    provider: 'resend' as const,
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL_ADDRESS || 'noreply@sybaupicture.com',
  },
  
  features: {
    debug: !isProduction,
    analytics: true,
    adsense: true, // AdSense始终启用
  }
}

// 配置验证
export function validateConfig() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'FAL_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  // 验证Google OAuth配置
  const googleClientId = isProduction 
    ? process.env.GOOGLE_CLIENT_ID_PROD
    : (process.env.GOOGLE_CLIENT_ID_DEV || process.env.GOOGLE_CLIENT_ID)
    
  if (!googleClientId) {
    console.warn('⚠️ Google OAuth not configured')
  }
  
  // 验证Stripe配置
  const stripeKey = isProduction
    ? process.env.STRIPE_SECRET_KEY_PROD
    : (process.env.STRIPE_SECRET_KEY_DEV || process.env.STRIPE_SECRET_KEY)
    
  if (!stripeKey) {
    console.warn('⚠️ Stripe not configured')
  }
}

// 获取环境信息
export function getEnvironmentInfo() {
  return {
    environment: isProduction ? 'production' : 'development',
    node: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    baseUrl: config.app.url,
  }
}

// 兼容性导出（保持向后兼容）
export const isDevelopment = !isProduction
export const appConfig = config