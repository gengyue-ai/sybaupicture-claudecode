#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取环境配置 - 使用与smart-env.js相同的逻辑
function readEnvLocal() {
  const envFile = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envFile)) {
    console.error('❌ .env.local 文件不存在');
    console.log('💡 请运行: node scripts/smart-env.js 开发 (或 生产)');
    process.exit(1);
  }

  const content = fs.readFileSync(envFile, 'utf8');
  const env = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

// 加载环境变量
const env = readEnvLocal();

// 设置数据库URL
if (!env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 未在 .env.local 中配置');
  process.exit(1);
}

// 设置环境变量给Prisma使用
process.env.DATABASE_URL = env.DATABASE_URL;

console.log('🔗 连接到数据库:', env.DATABASE_URL.includes('@') ? env.DATABASE_URL.split('@')[1].split('/')[0] : '已配置');

const { PrismaClient } = require('@prisma/client')

async function checkUserPlan(email) {
  const prisma = new PrismaClient()
  
  try {
    console.log(`\n🔍 检查用户套餐信息: ${email}`)
    console.log('=' .repeat(60))
    
    // 查询用户完整信息
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        plan: true,
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' }
        },
        usage: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    })
    
    if (!user) {
      console.log('❌ 用户不存在于数据库中')
      return
    }
    
    console.log('\n📊 用户基本信息:')
    console.log(`  ID: ${user.id}`)
    console.log(`  邮箱: ${user.email}`)
    console.log(`  姓名: ${user.name || 'N/A'}`)
    console.log(`  创建时间: ${user.createdAt}`)
    console.log(`  更新时间: ${user.updatedAt}`)
    console.log(`  Stripe客户ID: ${user.stripeCustomerId || 'N/A'}`)
    
    console.log('\n📋 当前套餐信息:')
    if (user.plan) {
      console.log(`  套餐ID: ${user.planId}`)
      console.log(`  套餐名称: ${user.plan.name}`)
      console.log(`  显示名称: ${user.plan.displayName}`)
      console.log(`  月费: $${user.plan.price}`)
      console.log(`  年费: $${user.plan.yearlyPrice || 'N/A'}`)
      console.log(`  每月最大图片数: ${user.plan.maxImagesPerMonth}`)
      console.log(`  是否有水印: ${user.plan.hasWatermark}`)
    } else {
      console.log('  ❌ 用户没有关联套餐!')
    }
    
    console.log('\n💳 订阅记录:')
    if (user.subscriptions.length === 0) {
      console.log('  📝 没有订阅记录')
    } else {
      user.subscriptions.forEach((sub, index) => {
        console.log(`  订阅 #${index + 1}:`)
        console.log(`    状态: ${sub.status}`)
        console.log(`    套餐: ${sub.plan.displayName} (${sub.plan.name})`)
        console.log(`    计费周期: ${sub.billingCycle}`)
        console.log(`    当前周期: ${sub.currentPeriodStart} - ${sub.currentPeriodEnd}`)
        console.log(`    Stripe订阅ID: ${sub.stripeSubscriptionId || 'N/A'}`)
        console.log(`    创建时间: ${sub.createdAt}`)
        if (sub.canceledAt) {
          console.log(`    取消时间: ${sub.canceledAt}`)
        }
        console.log('')
      })
    }
    
    console.log('\n📈 最近使用记录:')
    if (user.usage.length === 0) {
      console.log('  📝 没有使用记录')
    } else {
      user.usage.forEach((usage, index) => {
        console.log(`  ${usage.year}年${usage.month}月: ${usage.imagesGenerated}张图片`)
      })
    }
    
    // 分析套餐状态
    console.log('\n🔍 套餐状态分析:')
    const activeSubscription = user.subscriptions.find(sub => sub.status === 'active')
    
    if (activeSubscription) {
      console.log(`  ✅ 有活跃订阅: ${activeSubscription.plan.displayName}`)
      console.log(`  🔄 实际套餐: ${activeSubscription.plan.name}`)
      
      if (user.plan && user.plan.name !== activeSubscription.plan.name) {
        console.log(`  ⚠️  用户表套餐 (${user.plan.name}) 与活跃订阅套餐 (${activeSubscription.plan.name}) 不一致!`)
      } else {
        console.log(`  ✅ 用户表套餐与订阅套餐一致`)
      }
    } else {
      console.log(`  📝 没有活跃订阅`)
      if (user.plan) {
        console.log(`  🔄 默认套餐: ${user.plan.name}`)
      } else {
        console.log(`  ❌ 没有任何套餐信息!`)
      }
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 从命令行参数获取邮箱
const email = process.argv[2] || 'panyongqiang805@gmail.com'
checkUserPlan(email)