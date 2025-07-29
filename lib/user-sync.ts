import { createPrismaClient } from '@/lib/prisma'

export async function syncUser(userData: {
  email: string
  name?: string | null
  image?: string | null
}) {
  // 🎯 创建独立的数据库连接，避免prepared statement冲突
  const prisma = createPrismaClient()
  
  // 如果Prisma不可用，返回虚拟用户对象，不阻塞登录
  if (!prisma) {
    console.warn('❌ Prisma not available for user sync, allowing login without sync')
    return {
      id: 'temp-' + Date.now(),
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      image: userData.image,
      planName: 'free',
      isSubscribed: false,
      maxUsage: 5,
      usageCount: 0
    }
  }

  try {
    console.log('🔄 开始同步用户:', userData.email)
    
    // 设置超时机制，防止数据库操作卡住
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timeout')), 10000)
    })

    // 先尝试查找用户，带超时，包含subscription信息
    const findUserPromise = prisma.user.findUnique({
      where: { email: userData.email },
      include: {
        subscriptions: {
          where: { status: 'active' },
          include: {
            plan: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    let user = await Promise.race([findUserPromise, timeout]) as any

    if (user) {
      // 用户存在，更新信息
      console.log('📝 更新现有用户信息')
      const updatePromise = prisma.user.update({
        where: { email: userData.email },
        data: {
          name: userData.name || user.name,
          image: userData.image, // 使用Google最新头像
          updatedAt: new Date()
        },
        include: {
          subscriptions: {
            where: { status: 'active' },
            include: {
              plan: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
      user = await Promise.race([updatePromise, timeout])
      console.log('✅ 用户信息更新成功')
    } else {
      // 用户不存在，创建新用户
      console.log('👤 创建新用户')
      const createPromise = prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          image: userData.image,
          planId: null, // 默认没有付费套餐
        },
        include: {
          subscriptions: {
            where: { status: 'active' },
            include: {
              plan: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
      user = await Promise.race([createPromise, timeout])
      console.log('✅ 新用户创建成功')
    }

    // 获取当前月份的使用量
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const usagePromise = prisma.userUsage.findFirst({
      where: {
        userId: user.id,
        month: currentMonth,
        year: currentYear
      }
    })

    const usage = await Promise.race([usagePromise, timeout]) as any

    // 计算套餐信息
    const hasActiveSubscription = user.subscriptions.length > 0
    const activeSubscription = user.subscriptions[0]
    const planName = activeSubscription?.plan?.name || 'free'
    const maxUsage = activeSubscription?.plan?.maxImagesPerMonth || 5
    const usageCount = usage?.imagesGenerated || 0

    // 返回完整的用户信息
    const completeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      planName: planName,
      isSubscribed: hasActiveSubscription,
      maxUsage: maxUsage,
      usageCount: usageCount,
      subscriptionStatus: activeSubscription?.status || 'inactive',
      stripeCustomerId: activeSubscription?.stripeCustomerId || null
    }

    console.log('✅ 用户同步完成:', {
      email: completeUser.email,
      plan: completeUser.planName,
      isSubscribed: completeUser.isSubscribed,
      usage: `${completeUser.usageCount}/${completeUser.maxUsage}`
    })

    return completeUser
  } catch (error) {
    console.error('❌ User sync error, but allowing login:', error)
    // 返回临时用户对象，不阻塞登录
    return {
      id: 'temp-' + Date.now(),
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      image: userData.image,
      planName: 'free',
      isSubscribed: false,
      maxUsage: 5,
      usageCount: 0,
      subscriptionStatus: 'inactive',
      stripeCustomerId: null
    }
  }
} 