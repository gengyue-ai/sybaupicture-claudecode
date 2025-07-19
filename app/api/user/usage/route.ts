import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserPlanFeatures } from '@/lib/subscription'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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

    // 🔧 使用统一的套餐特性函数，支持硬编码标准版用户
    const planFeatures = await getUserPlanFeatures(user.id)
    const currentUsage = user.usage[0]?.imagesGenerated || 0
    
    // 判断订阅状态：数据库有活跃订阅 OR 是硬编码的标准版用户
    const hasActiveSubscription = user.subscriptions.length > 0 || planFeatures.maxImagesPerMonth > 1
    const planName = user.subscriptions[0]?.plan?.name || (planFeatures.maxImagesPerMonth === 60 ? 'standard' : 'free')

    console.log('💡 Usage API 套餐信息:', {
      userId: user.id,
      email: session.user.email,
      hasActiveSubscription,
      planName,
      maxUsage: planFeatures.maxImagesPerMonth,
      currentUsage
    })

    return NextResponse.json({
      isSubscribed: hasActiveSubscription,
      subscriptionPlan: planName,
      usageCount: currentUsage,
      maxUsage: planFeatures.maxImagesPerMonth,
      remainingUsage: Math.max(0, planFeatures.maxImagesPerMonth - currentUsage)
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
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