import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { stripe, createCheckoutSession, createStripeCustomer, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { getCurrentUserWithSubscription } from '@/lib/subscription'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
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
      console.log('User current plan:', currentPlan, 'Requested plan:', planType)
      
      // 如果用户已经有相同的套餐，不允许重复购买
      if (currentPlan === planType) {
        return NextResponse.json(
          { error: `You already have an active ${planType} subscription. Please manage your subscription from the billing portal.` },
          { status: 400 }
        )
      }
      
      // 如果用户已经有更高级的套餐，不允许降级
      if (currentPlan === 'pro' && planType === 'standard') {
        return NextResponse.json(
          { error: `You already have a PRO subscription. Please use the billing portal to manage your subscription.` },
          { status: 400 }
        )
      }
      
      // 允许从 Standard 升级到 PRO，这种情况需要特殊处理
      if (currentPlan === 'standard' && planType === 'pro') {
        console.log('🔄 User upgrading from Standard to PRO - creating upgrade session')
        // 这里我们创建一个升级会话，Stripe会自动处理按比例计费
      }
    }

    // 检查Stripe是否配置
    if (!stripe) {
      console.error('❌ Stripe not configured')
      return NextResponse.json(
        { 
          error: 'Payment system not configured',
          details: 'Stripe configuration missing',
          debug: process.env.NODE_ENV === 'development' ? {
            hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
            hasSecretKeyProd: !!process.env.STRIPE_SECRET_KEY_PROD,
            isProduction: process.env.NODE_ENV === 'production'
          } : undefined
        },
        { status: 500 }
      )
    }

    // 获取价格ID
    const priceId = STRIPE_PRICE_IDS[planType as keyof typeof STRIPE_PRICE_IDS]?.[billingCycle as keyof typeof STRIPE_PRICE_IDS.standard]

    console.log('Payment request:', { planType, billingCycle, priceId })
    console.log('Available price IDs:', STRIPE_PRICE_IDS)
    console.log('User info:', { userId: user.id, email: user.email, stripeCustomerId: user.stripeCustomerId })

    if (!priceId) {
      console.error('Price ID not found:', { planType, billingCycle, availablePrices: STRIPE_PRICE_IDS })
      return NextResponse.json(
        { error: `Price not found for ${planType} ${billingCycle}` },
        { status: 404 }
      )
    }

    // 创建或获取Stripe客户
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(user.email, user.name || undefined)
      stripeCustomerId = customer.id

      // 更新用户的Stripe客户ID
      if (prisma) {
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId }
        })
      }
    }

    // 创建结算会话
    console.log('Creating checkout session for user:', user.email)
    
    // 获取正确的基础URL - 优先使用NEXTAUTH_URL，然后是NEXT_PUBLIC_BASE_URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://sybaupicture.com'
    console.log('Using base URL for payment:', baseUrl)
    
    const checkoutSession = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      successUrl: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing`,
      userId: user.id
    })
    console.log('Checkout session created:', checkoutSession.id)

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    // 提供更详细的错误信息用于调试
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = {
      error: 'Failed to create checkout session',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }
    
    console.error('Detailed error:', errorDetails)
    
    return NextResponse.json(errorDetails, { status: 500 })
  }
}
