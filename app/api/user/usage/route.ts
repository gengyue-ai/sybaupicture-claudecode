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

    // 计算重置日期（下个月1号）
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    return NextResponse.json({
      success: true,
      data: {
        currentUsage: currentUsage,
        limit: actualMaxUsage,
        resetDate: nextMonth.toISOString(),
        isSubscribed: hasActiveSubscription,
        subscriptionPlan: planName,
        remainingUsage: Math.max(0, actualMaxUsage - currentUsage)
      }
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 🔥 修复双重计数：移除POST方法，防止前端重复更新使用量
// 使用量更新应该只在后端的图片生成流程中通过recordImageGeneration函数进行
// 这个API现在只提供GET方法来查询使用量，不再允许直接增加使用量

export async function POST() {
  // 🚫 禁用POST方法，防止双重计数
  return NextResponse.json({ 
    error: 'Usage increment should only be done through image generation API. This endpoint has been disabled to prevent double counting.',
    code: 'USAGE_UPDATE_DISABLED'
  }, { status: 405 }) // Method Not Allowed
}