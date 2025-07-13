import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getCurrentUserWithSubscription } from '@/lib/subscription'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await getCurrentUserWithSubscription()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 获取用户当前的活跃订阅
    const activeSubscription = user.subscriptions?.[0]
    const currentPlan = user.plan || activeSubscription?.plan

    // 获取用户当前的使用情况
    const currentUsage = user.usage?.[0]

    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        stripeCustomerId: user.stripeCustomerId
      },
      subscription: {
        isActive: !!activeSubscription,
        plan: currentPlan ? {
          id: currentPlan.id,
          name: currentPlan.name,
          displayName: currentPlan.displayName,
          price: currentPlan.price,
          maxImagesPerMonth: currentPlan.maxImagesPerMonth,
          maxResolution: currentPlan.maxResolution,
          hasWatermark: currentPlan.hasWatermark,
          hasPriorityProcessing: currentPlan.hasPriorityProcessing
        } : {
          name: 'free',
          displayName: 'Free',
          price: 0,
          maxImagesPerMonth: 1,
          maxResolution: '1024x1024',
          hasWatermark: false,
          hasPriorityProcessing: false
        },
        billingCycle: activeSubscription?.billingCycle || 'monthly',
        currentPeriodStart: activeSubscription?.currentPeriodStart || null,
        currentPeriodEnd: activeSubscription?.currentPeriodEnd || null,
        stripeSubscriptionId: activeSubscription?.stripeSubscriptionId || null
      },
      usage: {
        currentMonth: currentUsage?.imagesGenerated || 0,
        maxImages: currentPlan?.maxImagesPerMonth || 1,
        remainingImages: Math.max(0, (currentPlan?.maxImagesPerMonth || 1) - (currentUsage?.imagesGenerated || 0))
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
} 