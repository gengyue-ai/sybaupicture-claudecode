import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({
        isLoggedIn: false,
        subscription: null
      })
    }

    if (!prisma) {
      return NextResponse.json({
        isLoggedIn: true,
        subscription: null,
        error: 'Database not configured'
      })
    }

    // 快速查询用户订阅状态，只返回必要信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        subscriptions: {
          where: { status: 'active' },
          select: {
            status: true,
            billingCycle: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                name: true,
                displayName: true,
                maxImagesPerMonth: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        isLoggedIn: true,
        subscription: null,
        error: 'User not found'
      })
    }

    const activeSubscription = user.subscriptions[0]
    
    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        hasStripeCustomer: !!user.stripeCustomerId
      },
      subscription: activeSubscription ? {
        isActive: true,
        plan: activeSubscription.plan.name,
        displayName: activeSubscription.plan.displayName,
        billingCycle: activeSubscription.billingCycle,
        maxImages: activeSubscription.plan.maxImagesPerMonth,
        currentPeriodEnd: activeSubscription.currentPeriodEnd
      } : {
        isActive: false,
        plan: 'free',
        displayName: 'Free',
        maxImages: 1
      }
    })

  } catch (error) {
    console.error('Error fetching quick subscription status:', error)
    return NextResponse.json({
      isLoggedIn: true,
      subscription: null,
      error: 'Failed to fetch subscription status'
    })
  }
} 