import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 定义用户数据类型
interface UserData {
  id?: string
  email: string
  name: string
  image: string | null
  isSubscribed: boolean
  subscriptionPlan: string
  subscriptionStatus: string
  maxUsage: number
  usageCount: number
  stripeCustomerId: string | null
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('⚠️  用户未登录，返回默认数据')
      // 🚨 修复：不返回401状态码，而是返回默认的免费用户数据
      const defaultUserData: UserData = {
        email: 'anonymous@example.com',
        name: 'Anonymous User',
        image: null,
        isSubscribed: false,
        subscriptionPlan: 'free',
        subscriptionStatus: 'inactive',
        maxUsage: 5,
        usageCount: 0,
        stripeCustomerId: null
      }
      
      return NextResponse.json({
        success: true,
        user: defaultUserData,
        anonymous: true
      })
    }

    console.log('🔄 智能用户数据同步:', session.user.email)

    // 🎯 默认用户数据 - 确保总是有合理的回退值
    const defaultUserData: UserData = {
      email: session.user.email,
      name: session.user.name || session.user.email.split('@')[0],
      image: session.user.image || null,
      isSubscribed: false,
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive',
      maxUsage: 1, // 免费注册用户每月1张图片
      usageCount: 0,
      stripeCustomerId: null
    }

    // 🎯 如果数据库不可用，返回默认数据
    if (!prisma) {
      console.warn('⚠️  数据库未配置，使用默认数据')
      return NextResponse.json({
        success: true,
        user: defaultUserData,
        warning: 'Database not configured'
      })
    }

    // 🎯 尝试数据库操作，获取真实的订阅信息
    try {
      // 1. 查找或创建用户记录
      let dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          plan: true, // 直接关联的套餐
          subscriptions: {
            where: { 
              status: { in: ['active', 'trialing'] } // 有效订阅
            },
            include: {
              plan: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      if (!dbUser) {
        // 创建新用户并分配默认套餐
        console.log('👤 创建新用户:', session.user.email)
        
        // 先确保免费套餐存在
        const freePlan = await prisma.plan.upsert({
          where: { name: 'free' },
          create: {
            name: 'free',
            displayName: 'Free',
            description: 'Free plan with 1 image per month',
            price: 0,
            yearlyPrice: 0,
            maxImagesPerMonth: 1,
            maxResolution: '1024x1024',
            hasWatermark: false,
            hasPriorityProcessing: false,
            hasBatchProcessing: false,
            hasAdvancedFeatures: false,
            availableStyles: JSON.stringify(['classic']),
          },
          update: {
            maxImagesPerMonth: 1,
            hasWatermark: false,
            availableStyles: JSON.stringify(['classic']),
          }
        })
        
        // 创建用户并关联免费套餐
        dbUser = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || defaultUserData.name,
            image: session.user.image,
            password: null,
            planId: freePlan.id, // 分配免费套餐
          },
          include: {
            plan: true,
            subscriptions: {
              where: { 
                status: { in: ['active', 'trialing'] }
              },
              include: {
                plan: true
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        })
        console.log('✅ 新用户创建成功，已分配免费套餐:', freePlan.name)
      } else {
        // 检查现有用户是否有套餐，如果没有则分配免费套餐
        if (!dbUser.planId) {
          console.log('🔧 现有用户缺少套餐，分配免费套餐:', session.user.email)
          
          // 确保免费套餐存在
          const freePlan = await prisma.plan.upsert({
            where: { name: 'free' },
            create: {
              name: 'free',
              displayName: 'Free',
              description: 'Free plan with 1 image per month',
              price: 0,
              yearlyPrice: 0,
              maxImagesPerMonth: 1,
              maxResolution: '1024x1024',
              hasWatermark: false,
              hasPriorityProcessing: false,
              hasBatchProcessing: false,
              hasAdvancedFeatures: false,
              availableStyles: JSON.stringify(['classic']),
            },
            update: {}
          })
          
          // 更新用户分配免费套餐
          dbUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
              planId: freePlan.id,
              name: session.user.name || dbUser.name,
              image: session.user.image,
              updatedAt: new Date()
            },
            include: {
              plan: true,
              subscriptions: {
                where: { 
                  status: { in: ['active', 'trialing'] }
                },
                include: {
                  plan: true
                },
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          })
          console.log('✅ 用户免费套餐分配成功')
        } else {
          // 更新用户信息（特别是头像）
          if (session.user.image && session.user.image !== dbUser.image) {
            console.log('🖼️  更新用户头像')
            dbUser = await prisma.user.update({
              where: { email: session.user.email },
              data: {
                name: session.user.name || dbUser.name,
                image: session.user.image,
                updatedAt: new Date()
              },
              include: {
                plan: true,
                subscriptions: {
                  where: { 
                    status: { in: ['active', 'trialing'] }
                  },
                  include: {
                    plan: true
                  },
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            })
          }
        }
      }

      // 2. 计算套餐信息 - 优先使用有效订阅，其次使用直接关联套餐
      const activeSubscription = dbUser.subscriptions[0]
      const currentPlan = activeSubscription?.plan || dbUser.plan
      
      const isSubscribed = !!activeSubscription
      const planName = currentPlan?.name || 'free'
      const maxUsage = currentPlan?.maxImagesPerMonth || 5

      // 3. 获取当月使用量
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      const usage = await prisma.userUsage.findUnique({
        where: {
          userId_month_year: {
            userId: dbUser.id,
            month: currentMonth,
            year: currentYear
          }
        }
      })

      const usageCount = usage?.imagesGenerated || 0

      // 4. 构建完整的用户数据
      const userData: UserData = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || defaultUserData.name,
        image: dbUser.image,
        isSubscribed: isSubscribed,
        subscriptionPlan: planName,
        subscriptionStatus: activeSubscription?.status || 'inactive',
        maxUsage: maxUsage,
        usageCount: usageCount,
        stripeCustomerId: activeSubscription?.stripeCustomerId || dbUser.stripeCustomerId
      }

      console.log('✅ 用户数据同步成功:', {
        email: userData.email,
        plan: userData.subscriptionPlan,
        isSubscribed: userData.isSubscribed,
        usage: `${userData.usageCount}/${userData.maxUsage}`,
        hasStripeId: !!userData.stripeCustomerId
      })

      return NextResponse.json({
        success: true,
        user: userData
      })

    } catch (dbError) {
      // 🎯 数据库操作失败时，使用默认数据继续
      console.error('⚠️  数据库操作失败，使用默认数据:', dbError)
      
      return NextResponse.json({
        success: true,
        user: defaultUserData,
        warning: 'Database error - using default data'
      })
    }

  } catch (error) {
    console.error('❌ 用户数据同步失败:', error)
    
    return NextResponse.json({
      error: 'Failed to sync user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 