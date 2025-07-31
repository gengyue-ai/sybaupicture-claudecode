import { createPrismaClient } from '@/lib/prisma'
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
  // 模版权限控制 - 基于两组模版（5个+9个）
  availableTemplates: string[]  // 可用模版ID列表
  maxTemplates: number         // 最大模版数量
}

// 🎯 商业优化：所有套餐都无水印，提升用户体验和转化率
// 🔥 全面开放模版权限：所有用户都能使用全部模版，提升产品竞争力
export const DEFAULT_PLANS: Record<PlanType, PlanFeatures> = {
  free: {
    maxImagesPerMonth: 3,
    maxResolution: '1024x1024',
    hasWatermark: false, // ✅ 免费套餐也无水印
    hasPriorityProcessing: false,
    hasBatchProcessing: false,
    hasAdvancedFeatures: false,
    availableStyles: ['classic'],
    // 🔥 免费套餐：开放全部模版使用权限
    maxTemplates: 99, // 设置足够大的数字，表示无限制
    availableTemplates: [
      // 全部14个模版（5个基础+9个高级）
      'watermark-removal', 'body-optimization', 'tourist-removal',
      'ecommerce-display', 'background-replacement', 
      'element-integration', 'style-conversion', 'text-editing', 
      'detail-modification', 'professional-editing', 'artistic-transformation',
      'commercial-enhancement', 'creative-fusion', 'advanced-styling',
      // 首页展示模版
      'photography-showcase', 'ecommerce-showcase', 'fashion-showcase',
      'travel-showcase', 'realestate-showcase'
    ]
  },
  standard: {
    maxImagesPerMonth: 60,
    maxResolution: '1536x1536', // 🎯 调整分辨率层级
    hasWatermark: false, // ✅ 标准套餐无水印
    hasPriorityProcessing: false,
    hasBatchProcessing: false,
    hasAdvancedFeatures: false,
    availableStyles: ['classic', 'exaggerated', 'professional'],
    // 🔥 标准套餐：开放全部模版使用权限
    maxTemplates: 99, // 设置足够大的数字，表示无限制
    availableTemplates: [
      // 全部14个模版（5个基础+9个高级）
      'watermark-removal', 'body-optimization', 'tourist-removal',
      'ecommerce-display', 'background-replacement', 
      'element-integration', 'style-conversion', 'text-editing', 
      'detail-modification', 'professional-editing', 'artistic-transformation',
      'commercial-enhancement', 'creative-fusion', 'advanced-styling',
      // 首页展示模版
      'photography-showcase', 'ecommerce-showcase', 'fashion-showcase',
      'travel-showcase', 'realestate-showcase'
    ]
  },
  pro: {
    maxImagesPerMonth: 180,
    maxResolution: '2048x2048', // 🎯 Pro套餐最高分辨率
    hasWatermark: false, // ✅ 专业套餐无水印
    hasPriorityProcessing: true,
    hasBatchProcessing: false,
    hasAdvancedFeatures: true,
    availableStyles: ['classic', 'exaggerated', 'professional', 'artistic', 'premium'],
    // 🔥 Pro套餐：继续开放全部模版使用权限（与其他套餐一致）
    maxTemplates: 99, // 设置足够大的数字，表示无限制
    availableTemplates: [
      // 全部14个模版（5个基础+9个高级）
      'watermark-removal', 'body-optimization', 'tourist-removal',
      'ecommerce-display', 'background-replacement', 
      'element-integration', 'style-conversion', 'text-editing', 
      'detail-modification', 'professional-editing', 'artistic-transformation',
      'commercial-enhancement', 'creative-fusion', 'advanced-styling',
      // 首页展示模版
      'photography-showcase', 'ecommerce-showcase', 'fashion-showcase',
      'travel-showcase', 'realestate-showcase'
    ]
  }
}

/**
 * 获取当前用户信息和订阅状态
 */
export async function getCurrentUserWithSubscription() {
  const prisma = createPrismaClient()
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  if (!prisma) {
    // 数据库不可用，创建临时用户对象
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
    // 查询用户
    
    let user = await prisma!.user.findUnique({
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

    if (!user) {
      // 用户未找到
      
      // 尝试创建缺失的用户记录
      try {
        // 创建缺失的用户记录
        user = await prisma!.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || '',
            image: session.user.image || null,
            planId: 'free',
          },
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
        // 用户记录创建成功
      } catch (error) {
        console.error('❌ 用户记录创建失败:', error)
        return null
      }
    }

    if (user) {
      // 🎯 Ultra-Think分析：确定用户实际套餐
      const effectivePlan = user.subscriptions?.[0]?.plan || user.plan
      const effectivePlanName = effectivePlan?.name || 'free'
      
      console.log(`✅ 用户数据获取成功:`, {
        email: user.email,
        planId: user.planId,
        planName: user.plan?.name,
        activeSubscriptions: user.subscriptions?.length,
        subscriptionPlan: user.subscriptions?.[0]?.plan?.name,
        effectivePlanName: effectivePlanName,
        usageRecords: user.usage?.length
      })
    }

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
  const prisma = createPrismaClient()
  
  if (!userId) {
    return DEFAULT_PLANS.free
  }

  if (!prisma) {
    console.warn('⚠️  数据库不可用，返回默认套餐特性')
    return DEFAULT_PLANS.free // 在数据库不可用时给予免费套餐权限
  }

  try {
    // 🔧 关键修复：同时查询用户套餐和活跃订阅，优先使用活跃订阅
    const user = await prisma!.user.findUnique({
      where: { id: userId },
      include: { 
        plan: true,
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      console.log(`💡 用户ID ${userId} 不存在，返回免费套餐特性`)
      return DEFAULT_PLANS.free
    }

    // 🎯 优先级：活跃订阅套餐 > 用户直接关联套餐 > 免费套餐
    const effectivePlan = user.subscriptions[0]?.plan || user.plan
    
    if (!effectivePlan) {
      console.log(`💡 用户 ${user.email} 没有有效套餐，返回免费套餐特性`)
      return DEFAULT_PLANS.free
    }

    console.log(`✅ 用户 ${user.email} 有效套餐: ${effectivePlan.name} (${effectivePlan.maxImagesPerMonth}张/月)`)

    return {
      maxImagesPerMonth: effectivePlan.maxImagesPerMonth,
      maxResolution: effectivePlan.maxResolution,
      hasWatermark: effectivePlan.hasWatermark,
      hasPriorityProcessing: effectivePlan.hasPriorityProcessing,
      hasBatchProcessing: effectivePlan.hasBatchProcessing,
      hasAdvancedFeatures: effectivePlan.hasAdvancedFeatures,
      availableStyles: JSON.parse(effectivePlan.availableStyles || '["classic"]'),
      availableTemplates: [],
      maxTemplates: 0
    }
  } catch (error) {
    console.error('❌ 获取用户套餐特性失败:', error)
    return DEFAULT_PLANS.free // 错误时返回免费套餐特性
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
  const prisma = createPrismaClient()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  console.log(`🔍 检查用户生成权限:`, { userId, currentMonth, currentYear })

  if (!prisma) {
    console.warn('⚠️ 数据库不可用，使用默认免费套餐限制')
    const maxUsage = DEFAULT_PLANS.free.maxImagesPerMonth
    return {
      canGenerate: true,
      currentUsage: 0,
      maxUsage: maxUsage,
      remainingUsage: maxUsage
    }
  }

  try {
    // 获取用户套餐特性
    const features = await getUserPlanFeatures(userId)
    console.log(`📋 用户套餐特性:`, {
      userId,
      maxImagesPerMonth: features.maxImagesPerMonth
    })

    // 获取当月使用情况
    let usage = await prisma!.userUsage.findUnique({
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
      console.log(`📝 创建新的月度使用记录:`, { userId, currentMonth, currentYear })
      
      try {
        usage = await prisma!.userUsage.create({
          data: {
            userId,
            month: currentMonth,
            year: currentYear,
            imagesGenerated: 0
          }
        })
        console.log(`✅ 月度使用记录创建成功:`, usage)
      } catch (createError) {
        console.error(`❌ 创建月度使用记录失败:`, createError)
        // 创建失败时使用默认值
        usage = {
          id: 'temp',
          userId,
          month: currentMonth,
          year: currentYear,
          imagesGenerated: 0,
          lastResetAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }

    const currentUsage = usage.imagesGenerated
    const maxUsage = features.maxImagesPerMonth
    const remainingUsage = Math.max(0, maxUsage - currentUsage)
    const canGenerate = currentUsage < maxUsage

    console.log(`📊 用量检查结果:`, {
      userId,
      currentUsage,
      maxUsage,
      remainingUsage,
      canGenerate
    })

    return {
      canGenerate,
      currentUsage,
      maxUsage,
      remainingUsage
    }
  } catch (error: unknown) {
    console.error('❌ 检查用户使用权限失败:', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code
    })
    
    // 🔒 安全修复：数据库错误时拒绝生成，防止超限使用
    console.warn(`🚫 数据库错误，拒绝生成以防超限:`, { userId })
    
    return {
      canGenerate: false,
      currentUsage: 999, // 显示高用量以表明系统问题
      maxUsage: 3,
      remainingUsage: 0
    }
  }
}

/**
 * 记录用户生成图片
 */
export async function recordImageGeneration(userId: string): Promise<void> {
  const prisma = createPrismaClient()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  if (!prisma) {
    console.warn('⚠️  数据库不可用，跳过使用记录')
    return
  }

  try {
    await prisma!.userUsage.upsert({
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
 * 检查用户是否可以访问指定模版
 */
export async function canAccessTemplate(userId: string, templateId: string): Promise<boolean> {
  try {
    const features = await getUserPlanFeatures(userId)
    return features.availableTemplates.includes(templateId)
  } catch (error) {
    console.error('❌ 检查用户模版权限失败:', error)
    return false
  }
}

/**
 * 获取用户可用的模版列表
 */
export async function getUserAvailableTemplates(userId: string): Promise<string[]> {
  try {
    const features = await getUserPlanFeatures(userId)
    return features.availableTemplates
  } catch (error) {
    console.error('❌ 获取用户可用模版失败:', error)
    return DEFAULT_PLANS.free.availableTemplates
  }
}

/**
 * 获取用户的套餐类型
 */
export async function getUserPlanType(userId: string): Promise<PlanType> {
  const prisma = createPrismaClient()
  
  if (!prisma) {
    console.warn('⚠️  数据库不可用，返回免费套餐类型')
    return 'free'
  }

  try {
    // 🎯 Ultra-Think修复：同时检查活跃订阅和直接套餐关联
    const user = await prisma!.user.findUnique({
      where: { id: userId },
      include: { 
        plan: true,
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return 'free'
    }

    // 优先级：活跃订阅套餐 > 用户直接关联套餐 > 免费套餐
    const effectivePlan = user.subscriptions?.[0]?.plan || user.plan
    
    if (!effectivePlan) {
      return 'free'
    }

    // 根据套餐名称确定类型
    const planName = effectivePlan.name?.toLowerCase()
    console.log(`🔍 用户套餐分析:`, {
      userId,
      userEmail: user.email,
      planName: effectivePlan.name,
      hasActiveSubscription: !!user.subscriptions?.[0],
      finalPlanType: planName?.includes('pro') ? 'pro' : planName?.includes('standard') ? 'standard' : 'free'
    })
    
    if (planName?.includes('pro')) return 'pro'
    if (planName?.includes('standard')) return 'standard'
    return 'free'
  } catch (error) {
    console.error('❌ 获取用户套餐类型失败:', error)
    return 'free'
  }
}

/**
 * 更新用户套餐
 */
export async function updateUserPlan(userId: string, planType: PlanType): Promise<void> {
  const prisma = createPrismaClient()
  
  if (!prisma) {
    console.warn('⚠️  数据库不可用，跳过套餐更新')
    return
  }

  try {
    // 查找或创建套餐
    const plan = await prisma!.plan.upsert({
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
    await prisma!.user.update({
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
  const prisma = createPrismaClient()
  
  if (!prisma) {
    console.warn('⚠️  数据库不可用，跳过订阅创建')
    return null
  }

  try {
    // 查找或创建套餐
    const plan = await prisma!.plan.upsert({
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
    const subscription = await prisma!.subscription.create({
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
