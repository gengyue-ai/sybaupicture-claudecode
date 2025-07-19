// 加载环境变量
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

async function repairTestUser() {
  const prisma = new PrismaClient()
  
  try {
    const testEmail = 'panyongqiang805@gmail.com'
    console.log('🔧 开始修复测试用户:', testEmail)
    
    // Step 1: 确保标准套餐存在
    console.log('📋 Step 1: 确保标准套餐存在...')
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
        availableStyles: JSON.stringify(['classic', 'modern'])
      },
      update: {
        maxImagesPerMonth: 60,
        description: 'Standard plan with 60 images per month'
      }
    })
    console.log('✅ 标准套餐已确保存在:', standardPlan.name)
    
    // Step 2: 清理并重新创建测试用户
    console.log('👤 Step 2: 清理并重新创建测试用户...')
    
    // 删除现有的相关记录
    await prisma.userUsage.deleteMany({
      where: { user: { email: testEmail } }
    })
    console.log('🗑️ 清理了用量记录')
    
    await prisma.subscription.deleteMany({
      where: { user: { email: testEmail } }
    })
    console.log('🗑️ 清理了订阅记录')
    
    await prisma.generatedImage.deleteMany({
      where: { user: { email: testEmail } }
    })
    console.log('🗑️ 清理了生成的图片记录')
    
    // 删除用户记录
    await prisma.user.deleteMany({
      where: { email: testEmail }
    })
    console.log('🗑️ 清理了用户记录')
    
    // 重新创建用户
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Michael Pan (Test User)',
        image: null,
        planId: standardPlan.id
      }
    })
    console.log('✅ 创建了新用户:', newUser.email)
    
    // Step 3: 创建活跃订阅
    console.log('💳 Step 3: 创建活跃订阅...')
    const subscription = await prisma.subscription.create({
      data: {
        userId: newUser.id,
        planId: standardPlan.id,
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        stripeSubscriptionId: `test_${Date.now()}`,
        stripeCustomerId: null
      }
    })
    console.log('✅ 创建了活跃订阅:', subscription.status)
    
    // Step 4: 初始化当前月份用量
    console.log('📊 Step 4: 初始化当前月份用量...')
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
    console.log(`✅ 创建了${currentYear}-${currentMonth}月的用量记录: ${userUsage.imagesGenerated}/${standardPlan.maxImagesPerMonth}`)
    
    // Step 5: 验证修复结果
    console.log('🔍 Step 5: 验证修复结果...')
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
    
    if (verifyUser) {
      console.log('✅ 验证结果:')
      console.log('  用户邮箱:', verifyUser.email)
      console.log('  用户套餐:', verifyUser.plan?.name)
      console.log('  月度限制:', verifyUser.plan?.maxImagesPerMonth)
      console.log('  订阅状态:', verifyUser.subscriptions[0]?.status)
      console.log('  当前用量:', verifyUser.usage[0]?.imagesGenerated || 0)
      
      if (verifyUser.plan?.name === 'standard' && 
          verifyUser.subscriptions[0]?.status === 'active' &&
          verifyUser.plan?.maxImagesPerMonth === 60) {
        console.log('🎉 测试用户修复成功！')
      } else {
        console.log('❌ 修复验证失败')
      }
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

repairTestUser()