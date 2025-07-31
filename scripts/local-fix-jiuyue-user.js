#!/usr/bin/env node

/**
 * 本地修复九月用户双重计数问题
 * 直接连接数据库，绕过Vercel认证限制
 */

const { PrismaClient } = require('@prisma/client')

// 创建Prisma客户端
const prisma = new PrismaClient()

async function main() {
  console.log('🔧 开始修复九月用户双重计数问题...')
  
  try {
    const currentMonth = new Date().getMonth() + 1 // 8月 (7+1)
    const currentYear = new Date().getFullYear()
    
    console.log(`📅 当前月份: ${currentYear}-${currentMonth}`)
    
    // 查找九月用户的使用记录
    const jiuyueUsage = await prisma.userUsage.findMany({
      where: {
        month: currentMonth,
        year: currentYear,
        user: {
          email: {
            contains: '九月'
          }
        }
      },
      include: {
        user: {
          include: {
            plan: true,
            subscriptions: {
              where: { status: 'active' },
              include: { plan: true },
              take: 1
            },
            images: {
              where: {
                createdAt: {
                  gte: new Date(currentYear, currentMonth - 1, 1),
                  lt: new Date(currentYear, currentMonth, 1)
                }
              }
            }
          }
        }
      }
    })
    
    console.log(`🔍 找到九月用户数量: ${jiuyueUsage.length}`)
    
    for (const usage of jiuyueUsage) {
      const user = usage.user
      console.log(`\n👤 处理用户: ${user.email}`)
      console.log(`📊 当前使用量记录: ${usage.imagesGenerated}`)
      console.log(`🖼️ 实际生成图片数量: ${user.images.length}`)
      
      // 检查是否需要修复
      if (usage.imagesGenerated !== user.images.length) {
        console.log(`🚨 发现数据不一致！`)
        console.log(`   记录使用量: ${usage.imagesGenerated}`)
        console.log(`   实际生成量: ${user.images.length}`)
        
        // 修复数据
        const correctedUsage = user.images.length
        
        await prisma.userUsage.update({
          where: { id: usage.id },
          data: { 
            imagesGenerated: correctedUsage,
            updatedAt: new Date()
          }
        })
        
        console.log(`✅ 已修复: ${usage.imagesGenerated} → ${correctedUsage}`)
        
        // 获取用户套餐限制
        const planLimit = user.plan?.maxImagesPerMonth || 3 // 免费套餐默认3张
        console.log(`📝 修复后状态: ${correctedUsage}/${planLimit}`)
        
        if (correctedUsage <= planLimit) {
          console.log(`🎉 用户使用量恢复正常！`)
        } else {
          console.log(`⚠️ 用户仍然超限，但数据已修正`)
        }
      } else {
        console.log(`✅ 数据一致，无需修复`)
      }
    }
    
    console.log('\n🎉 九月用户修复完成！')
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 检查九月用户之前的状态
async function checkJiuyueUserStatus() {
  console.log('🔍 检查九月用户当前状态...')
  
  try {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    const jiuyueUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: '九月'
        }
      },
      include: {
        plan: true,
        usage: {
          where: {
            month: currentMonth,
            year: currentYear
          }
        },
        images: {
          where: {
            createdAt: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1)
            }
          }
        }
      }
    })
    
    console.log(`📊 九月用户状态报告:`)
    for (const user of jiuyueUsers) {
      const usage = user.usage[0]
      const planLimit = user.plan?.maxImagesPerMonth || 3
      
      console.log(`\n👤 ${user.email}`)
      console.log(`   套餐限制: ${planLimit}张/月`)
      console.log(`   记录使用量: ${usage?.imagesGenerated || 0}`)
      console.log(`   实际生成量: ${user.images.length}`)
      console.log(`   显示状态: ${usage?.imagesGenerated || 0}/${planLimit}`)
      
      if ((usage?.imagesGenerated || 0) > planLimit) {
        console.log(`   🚨 状态: 显示超限`)
      } else {
        console.log(`   ✅ 状态: 正常`)
      }
    }
    
  } catch (error) {
    console.error('❌ 检查状态时出错:', error)
  }
}

// 根据命令行参数决定执行什么操作
const command = process.argv[2]

if (command === 'check') {
  checkJiuyueUserStatus()
} else if (command === 'fix') {
  main()
} else {
  console.log('使用方法:')
  console.log('  node scripts/local-fix-jiuyue-user.js check  # 检查九月用户状态')
  console.log('  node scripts/local-fix-jiuyue-user.js fix    # 修复九月用户数据')
}