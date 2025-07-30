// 🔧 Sybau Picture - 智能环境配置管理 v2.0
// 保护AdSense：保留所有广告相关环境变量支持

// 🎯 更智能的环境检测逻辑
function detectEnvironment() {
  // 1. 优先检查显式的环境设置
  if (process.env.SYBAU_ENV === 'development') return 'development'
  if (process.env.SYBAU_ENV === 'production') return 'production'
  
  // 2. 检查NEXTAUTH_URL来判断环境
  const nextAuthUrl = process.env.NEXTAUTH_URL
  if (nextAuthUrl) {
    if (nextAuthUrl.includes('localhost') || nextAuthUrl.includes('127.0.0.1')) {
      return 'development'
    }
    if (nextAuthUrl.includes('sybaupicture.com')) {
      return 'production'
    }
  }
  
  // 3. 检查Vercel环境
  if (process.env.VERCEL_ENV === 'production') return 'production'
  if (process.env.VERCEL_ENV === 'development' || process.env.VERCEL_ENV === 'preview') {
    return 'development'
  }
  
  // 4. 作为最后手段，检查NODE_ENV
  if (process.env.NODE_ENV === 'production') return 'production'
  
  // 5. 默认为开发环境（更安全）
  return 'development'
}

const currentEnvironment = detectEnvironment()
const isProduction = currentEnvironment === 'production'
const isDevelopment = currentEnvironment === 'development'

console.log(`🌍 检测环境: ${currentEnvironment} (NODE_ENV: ${process.env.NODE_ENV || 'undefined'})`)

export const config = {
  app: {
    name: 'Sybau Picture',
    description: 'AI-powered image generation platform',
    url: isProduction 
      ? process.env.NEXTAUTH_URL || 'https://sybaupicture.com'
      : process.env.NEXTAUTH_URL || 'http://localhost:3003',
  },
  
  database: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '',
  },
  
  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'fallback-dev-secret-change-in-production',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID_PROD || process.env.GOOGLE_CLIENT_ID_DEV || process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_PROD || process.env.GOOGLE_CLIENT_SECRET_DEV || process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  
  ai: {
    falKey: process.env.FAL_KEY!,
  },
  
  stripe: {
    secretKey: isProduction
      ? (process.env.STRIPE_SECRET_KEY_PROD || process.env.STRIPE_SECRET_KEY)!
      : (process.env.STRIPE_SECRET_KEY_DEV || process.env.STRIPE_SECRET_KEY)!,
    publicKey: isProduction
      ? (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)!
      : (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)!,
    webhookSecret: isProduction
      ? (process.env.STRIPE_WEBHOOK_SECRET_PROD || process.env.STRIPE_WEBHOOK_SECRET)!
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

// 配置验证 - 增强生产环境检测，支持Supabase
export function validateConfig() {
  // 🎯 更新必需变量检查，支持Supabase数据库URL
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL
  const required = [
    'NEXTAUTH_SECRET',
    'FAL_KEY',
  ]
  
  console.log('🔍 验证环境配置:', {
    环境: currentEnvironment,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    数据库URL来源: process.env.DATABASE_URL ? 'DATABASE_URL' : 
                  process.env.POSTGRES_PRISMA_URL ? 'POSTGRES_PRISMA_URL' : 
                  process.env.POSTGRES_URL ? 'POSTGRES_URL' : '未找到'
  })
  
  const missing = required.filter(key => !process.env[key])
  
  // 🔧 检查数据库URL（支持多种Supabase变量）
  if (!dbUrl) {
    missing.push('DATABASE_URL (或 POSTGRES_PRISMA_URL/POSTGRES_URL)')
  }
  
  if (missing.length > 0) {
    console.error('❌ 缺少必需的环境变量:', missing)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  // 验证数据库URL格式
  if (dbUrl && (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    console.warn('⚠️ 数据库URL格式可能不正确')
  } else {
    console.log('✅ 数据库URL格式正确')
  }
  
  // 验证Google OAuth配置
  const googleClientId = isProduction 
    ? (process.env.GOOGLE_CLIENT_ID_PROD || process.env.GOOGLE_CLIENT_ID)
    : (process.env.GOOGLE_CLIENT_ID_DEV || process.env.GOOGLE_CLIENT_ID)
    
  if (!googleClientId) {
    console.warn('⚠️ Google OAuth未配置')
  } else {
    console.log('✅ Google OAuth已配置')
  }
  
  // 验证Stripe配置
  const stripeKey = isProduction
    ? (process.env.STRIPE_SECRET_KEY_PROD || process.env.STRIPE_SECRET_KEY)
    : (process.env.STRIPE_SECRET_KEY_DEV || process.env.STRIPE_SECRET_KEY)
    
  if (!stripeKey) {
    console.warn('⚠️ Stripe未配置')
  } else {
    console.log('✅ Stripe已配置')
  }
  
  // 验证邮件服务配置
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ 邮件服务未配置 (RESEND_API_KEY)')
  } else {
    console.log('✅ 邮件服务已配置')
  }
  
  console.log('✅ 环境配置验证完成')
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
export { isDevelopment }
export const appConfig = config