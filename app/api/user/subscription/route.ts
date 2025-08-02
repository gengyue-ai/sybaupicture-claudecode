import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createPrismaClient } from '@/lib/prisma'

// 强制动态渲染，因为我们使用了headers
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const prisma = createPrismaClient()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            plan: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 如果用户有活跃订阅
    if (user.subscriptions.length > 0) {
      const subscription = user.subscriptions[0]
      
      return NextResponse.json({
        success: true,
        data: {
          planName: subscription.plan.name,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
          cancelAtPeriodEnd: subscription.canceledAt !== null,
          priceId: subscription.stripePriceId,
          amount: subscription.plan.price * 100, // 转换为分
          currency: subscription.plan.currency,
          interval: subscription.billingCycle === 'monthly' ? 'month' : 'year'
        }
      })
    }

    // 用户没有订阅，返回免费套餐信息
    return NextResponse.json({
      success: true,
      data: null // 表示免费套餐
    })

  } catch (error: any) {
    console.error('❌ 获取订阅信息失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}