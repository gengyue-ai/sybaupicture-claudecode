// 强制修复测试用户数据库状态
// 加载环境变量
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

async function forceFixTestUser() {
  const prisma = new PrismaClient()
  
  try {
    const testEmail = 'panyongqiang805@gmail.com'
    console.log('🔧 强制修复测试用户数据库状态:', testEmail)
    
    // 检查数据库连接
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    
    // Step 1: 完全清理测试用户的所有数据
    console.log('🗑️ Step 1: 清理测试用户所有相关数据...')
    
    // 删除用量记录
    const deletedUsage = await prisma.userUsage.deleteMany({
      where: { user: { email: testEmail } }
    })
    console.log(`清理了 ${deletedUsage.count} 条用量记录`)
    
    // 删除生成的图片记录
    const deletedImages = await prisma.generatedImage.deleteMany({
      where: { user: { email: testEmail } }
    })
    console.log(`清理了 ${deletedImages.count} 条图片记录`)
    
    // 删除订阅记录
    const deletedSubscriptions = await prisma.subscription.deleteMany({
      where: { user: { email: testEmail } }
    })
    console.log(`清理了 ${deletedSubscriptions.count} 条订阅记录`)
    
    // 删除用户记录
    const deletedUsers = await prisma.user.deleteMany({
      where: { email: testEmail }
    })
    console.log(`清理了 ${deletedUsers.count} 条用户记录`)
    
    // Step 2: 创建或确保标准套餐存在
    console.log('📋 Step 2: 创建标准套餐...')
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
        availableStyles: JSON.stringify(['classic', 'modern', 'professional'])
      },
      update: {
        maxImagesPerMonth: 60,
        description: 'Standard plan with 60 images per month',
        hasWatermark: false,
        hasPriorityProcessing: true
      }
    })
    console.log('✅ 标准套餐已确保存在:', standardPlan.name, `(${standardPlan.maxImagesPerMonth}张/月)`)
    
    // Step 3: 创建测试用户并直接关联标准套餐
    console.log('👤 Step 3: 创建测试用户...')
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Michael Pan (Test Standard User)',
        image: null,
        planId: standardPlan.id  // 直接关联标准套餐
      }
    })
    console.log('✅ 测试用户创建成功:', newUser.email, '套餐ID:', newUser.planId)
    
    // Step 4: 创建活跃订阅记录
    console.log('💳 Step 4: 创建活跃订阅...')
    const subscription = await prisma.subscription.create({
      data: {
        userId: newUser.id,
        planId: standardPlan.id,
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        stripeSubscriptionId: `test_standard_${Date.now()}`,
        stripeCustomerId: null,
        stripePriceId: 'price_test_standard'
      }
    })
    console.log('✅ 活跃订阅创建成功:', subscription.status)
    
    // Step 5: 初始化当前月份用量
    console.log('📊 Step 5: 初始化用量记录...')
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    const userUsage = await prisma.userUsage.create({
      data: {
        userId: newUser.id,
        month: currentMonth,
        year: currentYear,
        imagesGenerated: 0
      }
    })
    console.log(`✅ 用量记录创建成功: ${currentYear}-${currentMonth}, 已用 ${userUsage.imagesGenerated}/${standardPlan.maxImagesPerMonth}`)
    
    // Step 6: 最终验证
    console.log('🔍 Step 6: 最终验证...')
    const verifyUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        plan: true,
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true }
        },
        usage: {
          where: {
            month: currentMonth,
            year: currentYear
          }
        }
      }
    })
    
    if (!verifyUser) {
      throw new Error('验证失败：用户未找到')
    }
    
    console.log('🎉 最终验证结果:')
    console.log('  用户邮箱:', verifyUser.email)
    console.log('  用户套餐:', verifyUser.plan?.name, `(${verifyUser.plan?.maxImagesPerMonth}张/月)`)
    console.log('  套餐ID:', verifyUser.planId)
    console.log('  活跃订阅:', verifyUser.subscriptions?.length > 0 ? '是' : '否')
    console.log('  订阅状态:', verifyUser.subscriptions[0]?.status)
    console.log('  当前用量:', verifyUser.usage[0]?.imagesGenerated || 0)
    
    // 验证结果
    const isValid = (
      verifyUser.plan?.name === 'standard' &&
      verifyUser.plan?.maxImagesPerMonth === 60 &&
      verifyUser.subscriptions[0]?.status === 'active' &&
      verifyUser.usage[0]?.imagesGenerated === 0
    )
    
    if (isValid) {
      console.log('🎉 测试用户修复完全成功!')
      console.log('👤 用户现在应该显示为: Standard Plan (60张/月)')
      console.log('💳 订阅状态: 活跃')
      console.log('📊 当前用量: 0/60')
    } else {
      console.log('❌ 修复验证失败，请检查数据')
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error)
    console.error('详细错误:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  forceFixTestUser()
}

module.exports = { forceFixTestUser }