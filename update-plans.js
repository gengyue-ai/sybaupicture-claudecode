const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updatePlans() {
  console.log('🚀 开始更新价格方案...')

  // 更新免费计划
  const freePlan = await prisma.plan.upsert({
    where: { name: 'free' },
    update: {
      maxImagesPerMonth: 3,
      hasWatermark: false,
    },
    create: {
      name: 'free',
      displayName: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      maxImagesPerMonth: 3,
      maxResolution: '1024x1024',
      hasWatermark: false,
      hasPriorityProcessing: false,
      hasBatchProcessing: false,
      hasAdvancedFeatures: false,
      availableStyles: JSON.stringify(['classic']),
      isActive: true
    }
  })

  console.log('✅ 免费计划已更新:', freePlan)
  console.log('🎉 价格方案更新完成！')
}

updatePlans()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 更新失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })