import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createPrismaClient } from '@/lib/prisma'
import { getUserPlanFeatures } from '@/lib/subscription'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 🎯 创建独立的数据库连接，避免prepared statement冲突
    const prisma = createPrismaClient()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // 查询用户信息和使用量
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptions: {
          where: { status: 'active' },
          select: {
            status: true,
            plan: {
              select: {
                name: true,
                maxImagesPerMonth: true
              }
            }
          },
          take: 1
        },
        usage: {
          where: {
            month: currentMonth,
            year: currentYear
          },
          select: {
            imagesGenerated: true
          },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 🔧 使用统一的套餐特性函数
    const planFeatures = await getUserPlanFeatures(user.id)
    const currentUsage = user.usage[0]?.imagesGenerated || 0
    
    // 🔧 修复：优先使用活跃订阅的套餐信息，这是最准确的数据源
    const hasActiveSubscription = user.subscriptions.length > 0
    
    // 获取用户基本套餐信息作为备用
    const userPlan = await prisma.user.findUnique({
      where: { id: user.id },
      include: { plan: true }
    })
    
    // 🎯 关键修复：优先级 - 活跃订阅套餐 > 用户关联套餐 > 免费套餐
    const effectiveSubscription = user.subscriptions[0] // 第一个就是活跃订阅
    const planName = effectiveSubscription?.plan?.name || userPlan?.plan?.name || 'free'
    const effectivePlan = effectiveSubscription?.plan || userPlan?.plan
    
    // 🔧 使用有效套餐的实际配额，而不是getUserPlanFeatures的默认值
    const actualMaxUsage = effectivePlan?.maxImagesPerMonth || planFeatures.maxImagesPerMonth

    console.log('💡 Usage API 套餐信息:', {
      userId: user.id,
      email: session.user.email,
      userPlanId: userPlan?.planId,
      userPlanName: userPlan?.plan?.name,
      hasActiveSubscription,
      subscriptionPlanName: user.subscriptions[0]?.plan?.name,
      finalPlanName: planName,
      maxUsage: planFeatures.maxImagesPerMonth,
      currentUsage
    })

    return NextResponse.json({
      isSubscribed: hasActiveSubscription,
      subscriptionPlan: planName,
      usageCount: currentUsage,
      maxUsage: actualMaxUsage,
      remainingUsage: Math.max(0, actualMaxUsage - currentUsage)
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    // 🎯 创建独立的数据库连接，避免prepared statement冲突
    const prisma = createPrismaClient()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // 查询用户ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 增加用户使用量
    const updatedUsage = await prisma.userUsage.upsert({
      where: {
        userId_month_year: {
          userId: user.id,
          month: currentMonth,
          year: currentYear
        }
      },
      update: {
        imagesGenerated: {
          increment: 1
        },
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        month: currentMonth,
        year: currentYear,
        imagesGenerated: 1
      }
    })

    console.log('✅ 用量更新成功:', {
      userId: user.id,
      month: currentMonth,
      year: currentYear,
      newUsageCount: updatedUsage.imagesGenerated
    })

    return NextResponse.json({
      success: true,
      usageCount: updatedUsage.imagesGenerated,
      month: currentMonth,
      year: currentYear
    })
  } catch (error) {
    console.error('❌ 更新用量失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}