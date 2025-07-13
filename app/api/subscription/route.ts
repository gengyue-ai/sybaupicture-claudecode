import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import {
  getCurrentUserWithSubscription,
  canUserGenerateImage,
  getUserPlanFeatures,
  updateUserPlan,
  PlanType
} from '@/lib/subscription'

// 获取用户订阅状态
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    // 获取使用情况
    const usageInfo = await canUserGenerateImage(user.id)
    const planFeatures = await getUserPlanFeatures(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planId: user.planId,
        plan: user.plan
      },
      subscription: user.subscriptions[0] || null,
      usage: {
        current: usageInfo.currentUsage,
        max: usageInfo.maxUsage,
        remaining: usageInfo.remainingUsage,
        canGenerate: usageInfo.canGenerate
      },
      features: planFeatures
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 更新用户套餐（用于管理员或升级）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planType } = body

    if (!planType || !['free', 'standard', 'pro'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    const user = await getCurrentUserWithSubscription()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 更新用户套餐
    await updateUserPlan(user.id, planType as PlanType)

    // 返回更新后的信息
    const updatedUser = await getCurrentUserWithSubscription()
    const usageInfo = await canUserGenerateImage(user.id)
    const planFeatures = await getUserPlanFeatures(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        planId: updatedUser?.planId,
        plan: updatedUser?.plan
      },
      usage: {
        current: usageInfo.currentUsage,
        max: usageInfo.maxUsage,
        remaining: usageInfo.remainingUsage,
        canGenerate: usageInfo.canGenerate
      },
      features: planFeatures
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
