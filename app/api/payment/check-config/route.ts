import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS, validatePriceIds } from '@/lib/stripe'

// 支付系统配置检查API
export async function GET() {
  try {
    const isProduction = process.env.NODE_ENV === 'production'
    
    // 检查Stripe配置
    const stripeConfig = {
      hasStripe: !!stripe,
      environment: isProduction ? 'production' : 'development',
      secretKey: {
        prod: !!process.env.STRIPE_SECRET_KEY_PROD,
        dev: !!process.env.STRIPE_SECRET_KEY_DEV,
        fallback: !!process.env.STRIPE_SECRET_KEY,
        expected: isProduction ? 'STRIPE_SECRET_KEY_PROD' : 'STRIPE_SECRET_KEY_DEV'
      },
      publishableKey: {
        prod: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD,
        dev: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV,
        fallback: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        expected: isProduction ? 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD' : 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV'
      }
    }
    
    // 检查价格ID配置
    const priceValidation = validatePriceIds()
    const priceConfig = {
      isValid: priceValidation.isValid,
      missing: priceValidation.missing,
      configured: {
        STRIPE_PRICE_STANDARD_MONTHLY: !!process.env.STRIPE_PRICE_STANDARD_MONTHLY,
        STRIPE_PRICE_STANDARD_YEARLY: !!process.env.STRIPE_PRICE_STANDARD_YEARLY,
        STRIPE_PRICE_PRO_MONTHLY: !!process.env.STRIPE_PRICE_PRO_MONTHLY,
        STRIPE_PRICE_PRO_YEARLY: !!process.env.STRIPE_PRICE_PRO_YEARLY
      },
      values: STRIPE_PRICE_IDS
    }
    
    // 检查Webhook配置
    const webhookConfig = {
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasWebhookSecretProd: !!process.env.STRIPE_WEBHOOK_SECRET_PROD,
      hasWebhookSecretDev: !!process.env.STRIPE_WEBHOOK_SECRET_DEV
    }
    
    // 总体状态评估
    const isFullyConfigured = stripeConfig.hasStripe && priceConfig.isValid && webhookConfig.hasWebhookSecret
    
    const result = {
      status: isFullyConfigured ? 'CONFIGURED' : 'INCOMPLETE',
      timestamp: new Date().toISOString(),
      environment: isProduction ? 'production' : 'development',
      stripe: stripeConfig,
      prices: priceConfig,
      webhook: webhookConfig,
      summary: {
        canProcessPayments: stripeConfig.hasStripe && priceConfig.isValid,
        canProcessWebhooks: !!webhookConfig.hasWebhookSecret,
        readyForProduction: isFullyConfigured
      }
    }
    
    console.log('💳 支付系统配置检查结果:', result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ 支付配置检查失败:', error)
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}