require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// 默认套餐配置
const DEFAULT_PLANS = {
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

async function setUserPlan(userEmail, planType) {
  try {
    console.log(`🔧 设置用户套餐: ${userEmail} -> ${planType}`)

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
      console.error(`❌ 用户未找到: ${userEmail}`)
      return false
    }

    console.log(`📋 当前用户状态:`, {
      email: user.email,
      currentPlanId: user.planId,
      currentPlanName: user.plan?.name,
      activeSubscriptions: user.subscriptions?.length
    })

    // 创建或更新Plan记录
    const plan = await prisma.plan.upsert({
      where: { name: planType },
      create: {
        name: planType,
        displayName: planType.charAt(0).toUpperCase() + planType.slice(1),
        description: `${planType} plan`,
        price: planType === 'free' ? 0 : planType === 'standard' ? 9 : 19,
        yearlyPrice: planType === 'free' ? 0 : planType === 'standard' ? 72 : 144,
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
      const canceledSubs = await prisma.subscription.updateMany({
        where: {
          userId: user.id,
          status: 'active'
        },
        data: {
          status: 'canceled',
          canceledAt: new Date()
        }
      })

      console.log(`📋 取消了 ${canceledSubs.count} 个现有订阅`)

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
      const canceledSubs = await prisma.subscription.updateMany({
        where: {
          userId: user.id,
          status: 'active'
        },
        data: {
          status: 'canceled',
          canceledAt: new Date()
        }
      })
      console.log(`✅ 免费套餐 - 已取消 ${canceledSubs.count} 个活跃订阅`)
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
      planMaxImages: finalUser?.plan?.maxImagesPerMonth,
      activeSubscriptions: finalUser?.subscriptions?.length,
      subscriptionPlan: finalUser?.subscriptions?.[0]?.plan?.name
    })

    return true

  } catch (error) {
    console.error('❌ 设置用户套餐失败:', error)
    return false
  }
}

async function main() {
  const userEmail = process.argv[2]
  const planType = process.argv[3]

  if (!userEmail || !planType) {
    console.log('使用方法: node set-user-plan.js <userEmail> <planType>')
    console.log('例如: node set-user-plan.js panyongqiang805@gmail.com standard')
    process.exit(1)
  }

  if (!['free', 'standard', 'pro'].includes(planType)) {
    console.error('❌ 无效的套餐类型。支持: free, standard, pro')
    process.exit(1)
  }

  const success = await setUserPlan(userEmail, planType)
  
  if (success) {
    console.log(`🎉 成功设置用户 ${userEmail} 为 ${planType} 套餐`)
  } else {
    console.log(`❌ 设置用户套餐失败`)
    process.exit(1)
  }
  
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('❌ 脚本执行失败:', error)
  process.exit(1)
})