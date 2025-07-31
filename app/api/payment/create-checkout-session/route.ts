import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { stripe, createCheckoutSession, createStripeCustomer, STRIPE_PRICE_IDS, validatePriceIds } from '@/lib/stripe'
import { getCurrentUserWithSubscription } from '@/lib/subscription'
import { createPrismaClient } from '@/lib/prisma'

// 环境判断
const isProduction = process.env.NODE_ENV === 'production'

export async function POST(request: NextRequest) {
  try {
    // 🎯 创建独立的数据库连接，避免prepared statement冲突
    const prisma = createPrismaClient()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planType, billingCycle } = body

    // 验证输入
    if (!planType || !billingCycle) {
      return NextResponse.json(
        { error: 'Plan type and billing cycle are required' },
        { status: 400 }
      )
    }

    if (!['standard', 'pro'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const user = await getCurrentUserWithSubscription()
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 检查用户是否已经有活跃订阅
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'active'
      },
      include: {
        plan: true
      }
    })

    // 检查用户是否已经有订阅
    if (activeSubscription) {
      const currentPlan = activeSubscription.plan.name
      // Payment request analysis
      
      // 如果用户已经有相同的套餐，允许切换计费周期
      if (currentPlan === planType) {
        // Same plan - allowing billing cycle change
        // 允许在月付和年付之间切换
      }
      
      // 如果用户已经有更高级的套餐，不允许降级
      if (currentPlan === 'pro' && planType === 'standard') {
        return NextResponse.json(
          { error: `You already have a PRO subscription. Please use the billing portal to manage your subscription.` },
          { status: 400 }
        )
      }
      
      // 允许从 Standard 升级到 PRO
      if (currentPlan === 'standard' && planType === 'pro') {
        // User upgrading from Standard to PRO
      }
      
      // 允许免费用户升级到任何付费套餐
      if (currentPlan === 'free') {
        // Free user upgrading
      }
    }

    // 检查Stripe是否配置
    if (!stripe) {
      const configStatus = {
        NODE_ENV: process.env.NODE_ENV,
        isProduction,
        hasStripeSecretKeyProd: !!process.env.STRIPE_SECRET_KEY_PROD,
        hasStripeSecretKeyDev: !!process.env.STRIPE_SECRET_KEY_DEV,
        hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        expectedKey: isProduction ? 'STRIPE_SECRET_KEY_PROD' : 'STRIPE_SECRET_KEY_DEV'
      }
      
      console.error('❌ Stripe配置缺失:', configStatus)
      
      return NextResponse.json(
        { 
          error: 'Payment system temporarily unavailable',
          details: `Stripe configuration missing for ${isProduction ? 'production' : 'development'} environment. Missing key: ${configStatus.expectedKey}`,
          code: 'STRIPE_NOT_CONFIGURED',
          debug: configStatus
        },
        { status: 503 }
      )
    }

    // 验证价格ID配置
    const priceValidation = validatePriceIds()
    if (!priceValidation.isValid) {
      console.error('❌ Stripe价格配置不完整:', {
        missing: priceValidation.missing,
        current: {
          STRIPE_PRICE_STANDARD_MONTHLY: !!process.env.STRIPE_PRICE_STANDARD_MONTHLY,
          STRIPE_PRICE_STANDARD_YEARLY: !!process.env.STRIPE_PRICE_STANDARD_YEARLY,
          STRIPE_PRICE_PRO_MONTHLY: !!process.env.STRIPE_PRICE_PRO_MONTHLY,
          STRIPE_PRICE_PRO_YEARLY: !!process.env.STRIPE_PRICE_PRO_YEARLY
        }
      })
      return NextResponse.json({
        error: 'Payment system configuration incomplete',
        details: `Missing price configuration: ${priceValidation.missing.join(', ')}. Please contact support.`,
        code: 'STRIPE_PRICE_CONFIG_INCOMPLETE',
        debug: priceValidation
      }, { status: 503 })
    }

    // 获取价格ID
    const priceId = STRIPE_PRICE_IDS[planType as keyof typeof STRIPE_PRICE_IDS]?.[billingCycle as keyof typeof STRIPE_PRICE_IDS.standard]

    // Payment request processed

    if (!priceId) {
      // Price ID not found
      return NextResponse.json(
        { error: `Price not found for ${planType} ${billingCycle}` },
        { status: 404 }
      )
    }

    // 创建或获取Stripe客户
    let stripeCustomerId = user.stripeCustomerId
    let needsNewCustomer = false
    
    // 检查现有客户ID在当前环境是否有效
    if (stripeCustomerId) {
      try {
        // 尝试获取客户信息来验证客户ID是否在当前环境中存在
        await stripe.customers.retrieve(stripeCustomerId)
        console.log('✅ 使用现有Stripe客户:', { customerId: stripeCustomerId })
      } catch (error) {
        console.log('⚠️ 现有Stripe客户ID在当前环境中不存在，将创建新客户:', { 
          oldCustomerId: stripeCustomerId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        needsNewCustomer = true
      }
    } else {
      needsNewCustomer = true
    }
    
    if (needsNewCustomer) {
      try {
        console.log('📝 创建Stripe客户:', { email: user.email, name: user.name })
        const customer = await createStripeCustomer(user.email, user.name || undefined)
        stripeCustomerId = customer.id
        console.log('✅ Stripe客户创建成功:', { customerId: stripeCustomerId })

        // 更新用户的Stripe客户ID
        if (prisma) {
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId }
          })
          console.log('✅ 用户Stripe客户ID已更新')
        }
      } catch (error) {
        console.error('❌ 创建Stripe客户失败:', error)
        return NextResponse.json({
          error: 'Failed to create customer profile',
          details: error instanceof Error ? error.message : 'Unknown customer creation error',
          code: 'STRIPE_CUSTOMER_CREATION_FAILED'
        }, { status: 500 })
      }
    }

    // 创建结算会话
    try {
      // 获取正确的基础URL - 优先使用NEXTAUTH_URL，然后是NEXT_PUBLIC_BASE_URL
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://sybaupicture.com'
      
      console.log('📝 创建结算会话:', {
        customerId: stripeCustomerId,
        priceId,
        planType,
        billingCycle,
        baseUrl,
        userId: user.id
      })
      
      const checkoutSession = await createCheckoutSession({
        customerId: stripeCustomerId || undefined,
        priceId,
        successUrl: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/pricing`,
        userId: user.id
      })
      
      console.log('✅ 结算会话创建成功:', {
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      })

      return NextResponse.json({
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      })
    } catch (error) {
      console.error('❌ 创建结算会话失败:', error)
      return NextResponse.json({
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown checkout session error',
        code: 'STRIPE_CHECKOUT_SESSION_FAILED'
      }, { status: 500 })
    }

  } catch (error) {
    // 全局错误捕获 - 处理未预期的错误
    console.error('❌ 支付系统未知错误:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      error: 'Payment system error',
      details: 'An unexpected error occurred. Please try again or contact support.',
      code: 'PAYMENT_SYSTEM_ERROR',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
