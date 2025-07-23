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
        // 创建新用户并分配套餐
        console.log('👤 创建新用户:', session.user.email)
        
        // 确保所有必要套餐存在
        const [freePlan, standardPlan] = await Promise.all([
          prisma.plan.upsert({
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
          }),
          prisma.plan.upsert({
            where: { name: 'standard' },
            create: {
              name: 'standard',
              displayName: 'Standard',
              description: 'Standard plan with 60 images per month',
              price: 9,
              yearlyPrice: 72,
              maxImagesPerMonth: 60,
              maxResolution: '2048x2048',
              hasWatermark: false,
              hasPriorityProcessing: true,
              hasBatchProcessing: false,
              hasAdvancedFeatures: false,
              availableStyles: JSON.stringify(['classic', 'modern', 'professional']),
            },
            update: {}
          })
        ])
        
        // 根据用户邮箱决定套餐（测试用户使用标准套餐）
        const isTestUser = session.user.email === 'panyongqiang805@gmail.com'
        const selectedPlan = isTestUser ? standardPlan : freePlan
        
        console.log(`📋 为用户 ${session.user.email} 分配套餐: ${selectedPlan.name}`)
        
        // 创建用户并关联套餐
        dbUser = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || defaultUserData.name,
            image: session.user.image,
            password: null,
            planId: selectedPlan.id, // 分配对应套餐
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
        console.log(`✅ 新用户创建成功，已分配${selectedPlan.name}套餐`)
        
        // 如果是测试用户，创建活跃订阅
        if (isTestUser) {
          const subscription = await prisma.subscription.create({
            data: {
              userId: dbUser.id,
              planId: standardPlan.id,
              status: 'active',
              billingCycle: 'monthly',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              stripeSubscriptionId: `test_standard_${Date.now()}`,
              stripeCustomerId: null
            }
          })
          console.log('✅ 测试用户活跃订阅创建成功')
          
          // 重新获取用户数据，包含新创建的订阅
          dbUser = await prisma.user.findUnique({
            where: { id: dbUser.id },
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
          }) || dbUser
        }
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
          // 🔧 特殊处理：修复panyongqiang805@gmail.com用户的套餐状态
          const isTestUser = session.user.email === 'panyongqiang805@gmail.com'
          
          if (isTestUser && dbUser.subscriptions.length === 0) {
            console.log('🔧 修复测试用户的订阅状态:', session.user.email)
            
            // 确保标准套餐存在
            const standardPlan = await prisma.plan.upsert({
              where: { name: 'standard' },
              create: {
                name: 'standard',
                displayName: 'Standard',
                description: 'Standard plan with 60 images per month',
                price: 9,
                yearlyPrice: 72,
                maxImagesPerMonth: 60,
                maxResolution: '2048x2048',
                hasWatermark: false,
                hasPriorityProcessing: true,
                hasBatchProcessing: false,
                hasAdvancedFeatures: false,
                availableStyles: JSON.stringify(['classic', 'modern', 'professional']),
              },
              update: {}
            })
            
            // 更新用户套餐为标准版
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { planId: standardPlan.id }
            })
            
            // 创建活跃订阅
            await prisma.subscription.create({
              data: {
                userId: dbUser.id,
                planId: standardPlan.id,
                status: 'active',
                billingCycle: 'monthly',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                stripeSubscriptionId: `test_standard_fix_${Date.now()}`,
                stripeCustomerId: null
              }
            })
            
            console.log('✅ 测试用户订阅状态修复完成')
            
            // 重新获取用户数据
            dbUser = await prisma.user.findUnique({
              where: { id: dbUser.id },
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
            }) || dbUser
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
      }

      // 2. 🔧 修复套餐信息计算 - 优先使用有效订阅，确保与usage API一致
      const activeSubscription = dbUser.subscriptions[0]
      const currentPlan = activeSubscription?.plan || dbUser.plan
      
      const isSubscribed = !!activeSubscription
      const planName = currentPlan?.name || 'free'
      const maxUsage = currentPlan?.maxImagesPerMonth || (planName === 'standard' ? 60 : planName === 'pro' ? 180 : 1)

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