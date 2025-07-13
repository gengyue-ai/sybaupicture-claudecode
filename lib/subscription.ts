import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// 套餐类型定义
export type PlanType = 'free' | 'standard' | 'pro'

export interface PlanFeatures {
  maxImagesPerMonth: number
  maxResolution: string
  hasWatermark: boolean
  hasPriorityProcessing: boolean
  hasBatchProcessing: boolean
  hasAdvancedFeatures: boolean
  availableStyles: string[]
}

// 默认套餐配置（按用户要求修改）
export const DEFAULT_PLANS: Record<PlanType, PlanFeatures> = {
  free: {
    maxImagesPerMonth: 1,
    maxResolution: '1024x1024',
    hasWatermark: false,
    hasPriorityProcessing: false,
    hasBatchProcessing: false,
    hasAdvancedFeatures: false,
    availableStyles: ['classic']
  },
  standard: {
    maxImagesPerMonth: 60,
    maxResolution: '2048x2048',
    hasWatermark: false,
    hasPriorityProcessing: false,
    hasBatchProcessing: false,
    hasAdvancedFeatures: false,
    availableStyles: ['classic', 'exaggerated', 'minimal', 'professional']
  },
  pro: {
    maxImagesPerMonth: 180,
    maxResolution: '4096x4096',
    hasWatermark: false,
    hasPriorityProcessing: true,
    hasBatchProcessing: false,
    hasAdvancedFeatures: true,
    availableStyles: ['classic', 'exaggerated', 'minimal', 'professional', 'artistic', 'premium']
  }
}

/**
 * 获取当前用户信息和订阅状态
 */
export async function getCurrentUserWithSubscription() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  if (!prisma) {
    console.warn('⚠️  数据库不可用，创建临时用户对象')
    // 创建临时用户对象，用于无数据库模式
    return {
      id: `temp-${session.user.email}`,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      stripeCustomerId: null,
      planId: null,
      plan: null,
      subscriptions: [],
      usage: []
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        plan: true,
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            plan: true
          }
        },
        usage: {
          where: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          }
        }
      }
    })

    return user
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    // 返回临时用户对象作为回退
    return {
      id: `temp-${session.user.email}`,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      stripeCustomerId: null,
      planId: null,
      plan: null,
      subscriptions: [],
      usage: []
    }
  }
}

/**
 * 获取用户的套餐特性
 */
export async function getUserPlanFeatures(userId?: string): Promise<PlanFeatures> {
  if (!userId) {
    return DEFAULT_PLANS.free
  }

  if (!prisma) {
    console.warn('⚠️  数据库不可用，返回默认套餐特性')
    return DEFAULT_PLANS.standard // 在数据库不可用时给予更多权限
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true }
    })

    if (!user?.plan) {
      return DEFAULT_PLANS.standard // 默认给予标准套餐特性
    }

    return {
      maxImagesPerMonth: user.plan.maxImagesPerMonth,
      maxResolution: user.plan.maxResolution,
      hasWatermark: user.plan.hasWatermark,
      hasPriorityProcessing: user.plan.hasPriorityProcessing,
      hasBatchProcessing: user.plan.hasBatchProcessing,
      hasAdvancedFeatures: user.plan.hasAdvancedFeatures,
      availableStyles: JSON.parse(user.plan.availableStyles || '["classic"]')
    }
  } catch (error) {
    console.error('❌ 获取用户套餐特性失败:', error)
    return DEFAULT_PLANS.standard // 错误时返回标准套餐特性
  }
}

/**
 * 检查用户是否可以生成图片（未超出限制）
 */
export async function canUserGenerateImage(userId: string): Promise<{
  canGenerate: boolean
  currentUsage: number
  maxUsage: number
  remainingUsage: number
}> {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  if (!prisma) {
    console.warn('⚠️  数据库不可用，允许生成图片')
    // 数据库不可用时，允许生成图片
    const maxUsage = DEFAULT_PLANS.standard.maxImagesPerMonth
    return {
      canGenerate: true,
      currentUsage: 0,
      maxUsage: maxUsage,
      remainingUsage: maxUsage
    }
  }

  try {
    // 获取用户套餐
    const features = await getUserPlanFeatures(userId)

    // 获取当月使用情况
    let usage = await prisma.userUsage.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: currentMonth,
          year: currentYear
        }
      }
    })

    // 如果没有使用记录，创建一个
    if (!usage) {
      usage = await prisma.userUsage.create({
        data: {
          userId,
          month: currentMonth,
          year: currentYear,
          imagesGenerated: 0
        }
      })
    }

    const currentUsage = usage.imagesGenerated
    const maxUsage = features.maxImagesPerMonth
    const remainingUsage = Math.max(0, maxUsage - currentUsage)
    const canGenerate = currentUsage < maxUsage

    return {
      canGenerate,
      currentUsage,
      maxUsage,
      remainingUsage
    }
  } catch (error) {
    console.error('❌ 检查用户使用权限失败:', error)
    // 错误时允许生成图片
    const maxUsage = DEFAULT_PLANS.standard.maxImagesPerMonth
    return {
      canGenerate: true,
      currentUsage: 0,
      maxUsage: maxUsage,
      remainingUsage: maxUsage
    }
  }
}

/**
 * 记录用户生成图片
 */
export async function recordImageGeneration(userId: string): Promise<void> {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  if (!prisma) {
    console.warn('⚠️  数据库不可用，跳过使用记录')
    return
  }

  try {
    await prisma.userUsage.upsert({
      where: {
        userId_month_year: {
          userId,
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
        userId,
        month: currentMonth,
        year: currentYear,
        imagesGenerated: 1
      }
    })
  } catch (error) {
    console.error('❌ 记录用户生成图片失败:', error)
    // 不阻塞流程，只记录错误
  }
}

/**
 * 检查用户是否有特定权限
 */
export async function hasPermission(userId: string, permission: keyof PlanFeatures): Promise<boolean> {
  try {
    const features = await getUserPlanFeatures(userId)
    return features[permission] === true
  } catch (error) {
    console.error('❌ 检查用户权限失败:', error)
    return false
  }
}

/**
 * 获取用户的套餐类型
 */
export async function getUserPlanType(userId: string): Promise<PlanType> {
  if (!prisma) {
    console.warn('⚠️  数据库不可用，返回标准套餐类型')
    return 'standard'
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true }
    })

    if (!user?.plan) {
      return 'standard'
    }

    // 根据套餐名称确定类型
    const planName = user.plan.name?.toLowerCase()
    if (planName?.includes('pro')) return 'pro'
    if (planName?.includes('standard')) return 'standard'
    return 'standard'
  } catch (error) {
    console.error('❌ 获取用户套餐类型失败:', error)
    return 'standard'
  }
}

/**
 * 更新用户套餐
 */
export async function updateUserPlan(userId: string, planType: PlanType): Promise<void> {
  if (!prisma) {
    console.warn('⚠️  数据库不可用，跳过套餐更新')
    return
  }

  try {
    // 查找或创建套餐
    const plan = await prisma.plan.upsert({
      where: { name: planType },
      create: {
        name: planType,
        displayName: planType.charAt(0).toUpperCase() + planType.slice(1),
        description: `${planType} plan`,
        price: 0,
        yearlyPrice: 0,
        maxImagesPerMonth: DEFAULT_PLANS[planType].maxImagesPerMonth,
        maxResolution: DEFAULT_PLANS[planType].maxResolution,
        hasWatermark: DEFAULT_PLANS[planType].hasWatermark,
        hasPriorityProcessing: DEFAULT_PLANS[planType].hasPriorityProcessing,
        hasBatchProcessing: DEFAULT_PLANS[planType].hasBatchProcessing,
        hasAdvancedFeatures: DEFAULT_PLANS[planType].hasAdvancedFeatures,
        availableStyles: JSON.stringify(DEFAULT_PLANS[planType].availableStyles),
      },
      update: {
        displayName: planType.charAt(0).toUpperCase() + planType.slice(1),
        maxImagesPerMonth: DEFAULT_PLANS[planType].maxImagesPerMonth,
        maxResolution: DEFAULT_PLANS[planType].maxResolution,
        hasWatermark: DEFAULT_PLANS[planType].hasWatermark,
        hasPriorityProcessing: DEFAULT_PLANS[planType].hasPriorityProcessing,
        hasBatchProcessing: DEFAULT_PLANS[planType].hasBatchProcessing,
        hasAdvancedFeatures: DEFAULT_PLANS[planType].hasAdvancedFeatures,
        availableStyles: JSON.stringify(DEFAULT_PLANS[planType].availableStyles),
      }
    })

    // 更新用户套餐
    await prisma.user.update({
      where: { id: userId },
      data: { planId: plan.id }
    })
  } catch (error) {
    console.error('❌ 更新用户套餐失败:', error)
  }
}

/**
 * 创建订阅
 */
export async function createSubscription({
  userId,
  planType,
  billingCycle,
  stripeSubscriptionId,
  stripeCustomerId,
  stripePriceId
}: {
  userId: string
  planType: PlanType
  billingCycle: 'monthly' | 'yearly'
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  stripePriceId?: string
}) {
  if (!prisma) {
    console.warn('⚠️  数据库不可用，跳过订阅创建')
    return null
  }

  try {
    // 查找或创建套餐
    const plan = await prisma.plan.upsert({
      where: { name: planType },
      create: {
        name: planType,
        displayName: planType.charAt(0).toUpperCase() + planType.slice(1),
        description: `${planType} plan`,
        price: 0,
        yearlyPrice: 0,
        maxImagesPerMonth: DEFAULT_PLANS[planType].maxImagesPerMonth,
        maxResolution: DEFAULT_PLANS[planType].maxResolution,
        hasWatermark: DEFAULT_PLANS[planType].hasWatermark,
        hasPriorityProcessing: DEFAULT_PLANS[planType].hasPriorityProcessing,
        hasBatchProcessing: DEFAULT_PLANS[planType].hasBatchProcessing,
        hasAdvancedFeatures: DEFAULT_PLANS[planType].hasAdvancedFeatures,
        availableStyles: JSON.stringify(DEFAULT_PLANS[planType].availableStyles),
      },
      update: {}
    })

    // 创建订阅
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: 'active',
        billingCycle,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
        stripeSubscriptionId,
        stripeCustomerId,
        stripePriceId,
      }
    })

    return subscription
  } catch (error) {
    console.error('❌ 创建订阅失败:', error)
    return null
  }
}
