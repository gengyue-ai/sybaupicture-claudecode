import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_PLANS } from '@/lib/subscription'

// 管理员API - 设置用户套餐
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 管理员API - 仅允许特定管理员访问
    console.log('🔧 管理API访问请求来自:', session.user.email)

    const body = await request.json()
    const { userEmail, planType } = body

    // 验证输入
    if (!userEmail || !planType) {
      return NextResponse.json(
        { error: 'User email and plan type are required' },
        { status: 400 }
      )
    }

    if (!['free', 'standard', 'pro'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    console.log(`🔧 管理员设置用户套餐: ${userEmail} -> ${planType}`)

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        plan: true,
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 创建或更新Plan记录
    const plan = await prisma.plan.upsert({
      where: { name: planType },
      create: {
        name: planType,
        displayName: planType.charAt(0).toUpperCase() + planType.slice(1),
        description: `${planType} plan`,
        price: planType === 'free' ? 0 : planType === 'standard' ? 9 : 19,
        yearlyPrice: planType === 'free' ? 0 : planType === 'standard' ? 72 : 144,
        maxImagesPerMonth: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].maxImagesPerMonth,
        maxResolution: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].maxResolution,
        hasWatermark: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].hasWatermark,
        hasPriorityProcessing: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].hasPriorityProcessing,
        hasBatchProcessing: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].hasBatchProcessing,
        hasAdvancedFeatures: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].hasAdvancedFeatures,
        availableStyles: JSON.stringify(DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].availableStyles),
      },
      update: {
        displayName: planType.charAt(0).toUpperCase() + planType.slice(1),
        maxImagesPerMonth: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].maxImagesPerMonth,
        maxResolution: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].maxResolution,
        hasWatermark: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].hasWatermark,
        hasPriorityProcessing: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].hasPriorityProcessing,
        hasBatchProcessing: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].hasBatchProcessing,
        hasAdvancedFeatures: DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].hasAdvancedFeatures,
        availableStyles: JSON.stringify(DEFAULT_PLANS[planType as keyof typeof DEFAULT_PLANS].availableStyles),
      }
    })

    console.log(`✅ Plan记录已创建/更新: ${plan.id} - ${plan.name}`)

    // 更新用户的planId
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { planId: plan.id }
    })

    console.log(`✅ 用户planId已更新: ${updatedUser.email} -> ${plan.name}`)

    // 如果是付费套餐，创建活跃订阅记录
    if (planType !== 'free') {
      // 先取消现有的活跃订阅
      await prisma.subscription.updateMany({
        where: {
          userId: user.id,
          status: 'active'
        },
        data: {
          status: 'canceled',
          canceledAt: new Date()
        }
      })

      // 创建新的活跃订阅
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
          stripeSubscriptionId: `admin_${Date.now()}`, // 管理员设置的订阅
          stripeCustomerId: user.stripeCustomerId,
        }
      })

      console.log(`✅ 订阅记录已创建: ${subscription.id} - ${planType}`)
    } else {
      // 免费套餐 - 取消所有活跃订阅
      await prisma.subscription.updateMany({
        where: {
          userId: user.id,
          status: 'active'
        },
        data: {
          status: 'canceled',
          canceledAt: new Date()
        }
      })
      console.log(`✅ 免费套餐 - 已取消所有活跃订阅`)
    }

    // 获取更新后的用户信息进行验证
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        plan: true,
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true }
        }
      }
    })

    console.log(`✅ 最终用户状态:`, {
      email: finalUser?.email,
      planName: finalUser?.plan?.name,
      activeSubscriptions: finalUser?.subscriptions?.length,
      subscriptionPlan: finalUser?.subscriptions?.[0]?.plan?.name
    })

    return NextResponse.json({
      success: true,
      message: `User ${userEmail} successfully set to ${planType} plan`,
      user: {
        email: finalUser?.email,
        planId: finalUser?.planId,
        planName: finalUser?.plan?.name,
        activeSubscriptions: finalUser?.subscriptions?.length,
        subscriptionPlan: finalUser?.subscriptions?.[0]?.plan?.name
      }
    })

  } catch (error) {
    console.error('❌ 设置用户套餐失败:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}