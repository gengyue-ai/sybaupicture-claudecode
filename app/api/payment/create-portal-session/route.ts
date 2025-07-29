import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createPortalSession } from '@/lib/stripe'
import { getCurrentUserWithSubscription } from '@/lib/subscription'

export async function POST(_request: NextRequest) {
  try {
    console.log('🏗️ 开始创建Stripe客户门户会话...')
    
    const session = await getServerSession(authOptions)
    console.log('👤 用户会话状态:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email
    })

    if (!session?.user?.email) {
      console.error('❌ 用户未认证 - 缺少会话或邮箱')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 获取用户信息
    console.log('🔍 查找用户订阅信息...')
    const user = await getCurrentUserWithSubscription()
    console.log('📊 用户数据:', {
      found: !!user,
      userId: user?.id,
      email: user?.email,
      stripeCustomerId: user?.stripeCustomerId,
      planId: user?.planId
    })
    
    if (!user) {
      console.error('❌ 数据库中未找到用户记录')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.stripeCustomerId) {
      console.warn('⚠️ 用户缺少Stripe客户ID，尝试创建:', {
        userId: user.id,
        email: user.email,
        planId: user.planId
      })
      
      // 为免费用户创建Stripe客户记录
      try {
        const { createStripeCustomer } = await import('@/lib/stripe')
        const customer = await createStripeCustomer(user.email, user.name || '')
        
        // 更新用户的Stripe客户ID
        const { createPrismaClient } = await import('@/lib/prisma')
        const prisma = createPrismaClient()
        if (prisma) {
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customer.id }
          })
          user.stripeCustomerId = customer.id
          console.log('✅ Stripe客户记录创建成功:', customer.id)
        }
      } catch (error) {
        console.error('❌ 创建Stripe客户记录失败:', error)
        return NextResponse.json(
          { error: 'Failed to create customer record' },
          { status: 500 }
        )
      }
    }

    // 创建客户门户会话
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/billing`
    console.log('🚪 创建客户门户会话:', {
      customerId: user.stripeCustomerId,
      returnUrl: returnUrl
    })
    
    const portalSession = await createPortalSession(
      user.stripeCustomerId,
      returnUrl
    )
    
    console.log('✅ 客户门户会话创建成功:', {
      sessionId: portalSession.id,
      url: portalSession.url
    })

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error) {
    console.error('❌ 创建门户会话时发生错误:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name
    })
    
    // 提供更详细的错误信息
    let errorMessage = 'Failed to create portal session'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('Stripe not configured')) {
        errorMessage = 'Payment system not configured'
        statusCode = 503
      } else if (error.message.includes('No such customer')) {
        errorMessage = 'Customer record not found in payment system'
        statusCode = 404
      } else if (error.message.includes('Invalid API key')) {
        errorMessage = 'Payment system authentication failed'
        statusCode = 503
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
