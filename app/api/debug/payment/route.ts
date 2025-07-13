import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { getCurrentUserWithSubscription } from '@/lib/subscription'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 支付调试检查开始...')
    
    // 1. 检查认证状态
    const session = await getServerSession(authOptions)
    console.log('🔐 认证状态:', !!session?.user?.email)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        step: 'authentication'
      }, { status: 401 })
    }

    // 2. 检查用户信息
    const user = await getCurrentUserWithSubscription()
    console.log('👤 用户信息:', {
      id: user?.id,
      email: user?.email,
      stripeCustomerId: user?.stripeCustomerId
    })

    // 3. 检查Stripe配置
    const stripeConfig = {
      stripe_available: !!stripe,
      price_ids: STRIPE_PRICE_IDS,
      env_vars: {
        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
        STRIPE_PRICE_PRO_MONTHLY: !!process.env.STRIPE_PRICE_PRO_MONTHLY,
        STRIPE_PRICE_PRO_YEARLY: !!process.env.STRIPE_PRICE_PRO_YEARLY,
        STRIPE_PRICE_STANDARD_MONTHLY: !!process.env.STRIPE_PRICE_STANDARD_MONTHLY,
        STRIPE_PRICE_STANDARD_YEARLY: !!process.env.STRIPE_PRICE_STANDARD_YEARLY,
      }
    }

    console.log('💳 Stripe配置:', stripeConfig)

    // 4. 测试Stripe连接
    let stripeTest = null
    if (stripe) {
      try {
        const account = await stripe.accounts.retrieve()
        stripeTest = {
          connected: true,
          account_id: account.id,
          country: account.country
        }
      } catch (error) {
        stripeTest = {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    console.log('🔗 Stripe连接测试:', stripeTest)

    // 5. 检查价格配置
    const priceTests: Record<string, { priceId: string | undefined; configured: boolean }> = {}
    for (const plan of ['standard', 'pro']) {
      for (const cycle of ['monthly', 'yearly']) {
        const priceId = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS]?.[cycle as keyof typeof STRIPE_PRICE_IDS.standard]
        priceTests[`${plan}_${cycle}`] = {
          priceId,
          configured: !!priceId
        }
      }
    }

    console.log('💰 价格配置测试:', priceTests)

    return NextResponse.json({
      success: true,
      debug_info: {
        authentication: {
          logged_in: true,
          user_email: session.user.email
        },
        user_info: {
          id: user?.id,
          email: user?.email,
          stripe_customer_id: user?.stripeCustomerId,
          has_subscription: !!user?.subscriptions?.length
        },
        stripe_config: stripeConfig,
        stripe_connection: stripeTest,
        price_configuration: priceTests,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 支付调试错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 