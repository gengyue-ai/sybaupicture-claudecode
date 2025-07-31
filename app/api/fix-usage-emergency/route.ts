import { NextRequest, NextResponse } from 'next/server'
import { createPrismaClient } from '@/lib/prisma'
import { getUserPlanFeatures } from '@/lib/subscription'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 紧急修复API - 绕过认证，专门修复九月用户4/3问题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 简单的紧急密钥验证
    if (body.emergency_key !== 'fix-jiuyue-4-3-issue-2024') {
      return NextResponse.json({ 
        error: 'Invalid emergency key' 
      }, { status: 401 })
    }

    const prisma = createPrismaClient()
    if (!prisma) {
      return NextResponse.json({ 
        error: 'Database not available' 
      }, { status: 500 })
    }

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    console.log('🚨 紧急修复：开始修复历史使用量数据...')

    // 获取当月所有超限的用户
    const problematicUsage = await prisma.userUsage.findMany({
      where: {
        month: currentMonth,
        year: currentYear
      },
      include: {
        user: {
          include: {
            plan: true,
            subscriptions: {
              where: { status: 'active' },
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            // 包含实际的生成记录
            images: {
              where: {
                createdAt: {
                  gte: new Date(currentYear, currentMonth - 1, 1),
                  lt: new Date(currentYear, currentMonth, 1)
                }
              },
              select: {
                id: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    const fixes = []
    let jiuyueFixed = false

    for (const usage of problematicUsage) {
      const user = usage.user
      if (!user) continue

      // 获取用户的正确套餐限制
      const planFeatures = await getUserPlanFeatures(user.id)
      const correctLimit = planFeatures.maxImagesPerMonth
      
      const actualGeneratedCount = user.images?.length || 0
      const recordedUsage = usage.imagesGenerated

      // 检查是否需要修复（超限或明显的双重计数）
      let needsFix = false
      let newUsage = recordedUsage

      if (recordedUsage > correctLimit) {
        // 情况1：记录的使用量超过了套餐限制
        needsFix = true
        newUsage = Math.min(actualGeneratedCount, correctLimit)
      } else if (actualGeneratedCount > 0 && Math.abs(recordedUsage - actualGeneratedCount) > 1) {
        // 情况2：记录使用量与实际生成数量差异过大
        needsFix = true
        newUsage = Math.min(actualGeneratedCount, correctLimit)
      }

      if (needsFix) {
        console.log(`🔧 修复用户 ${user.email}: ${recordedUsage} → ${newUsage}`)
        
        await prisma.userUsage.update({
          where: { id: usage.id },
          data: { 
            imagesGenerated: newUsage,
            updatedAt: new Date()
          }
        })

        fixes.push({
          email: user.email,
          oldUsage: recordedUsage,
          actualGenerated: actualGeneratedCount,
          newUsage: newUsage,
          limit: correctLimit
        })

        // 特别标记九月用户
        if (user.email && (user.email.includes('九月') || user.email.includes('jiuyue'))) {
          jiuyueFixed = true
        }
      }
    }

    console.log(`🎉 紧急修复完成: 修复了 ${fixes.length} 个用户`)

    return NextResponse.json({
      success: true,
      method: 'emergency_fix',
      jiuyueFixed: jiuyueFixed,
      summary: {
        totalUsersChecked: problematicUsage.length,
        fixesApplied: fixes.length,
        month: currentMonth,
        year: currentYear
      },
      fixes: fixes,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Emergency fix error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET方法用于检查有哪些用户需要修复
export async function GET() {
  try {
    const prisma = createPrismaClient()
    if (!prisma) {
      return NextResponse.json({ 
        error: 'Database not available' 
      }, { status: 500 })
    }

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // 查找所有可能有问题的用户
    const allUsage = await prisma.userUsage.findMany({
      where: {
        month: currentMonth,
        year: currentYear
      },
      include: {
        user: {
          include: {
            plan: true,
            subscriptions: {
              where: { status: 'active' },
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    const issues = []
    
    for (const usage of allUsage) {
      const user = usage.user
      if (!user) continue

      const planFeatures = await getUserPlanFeatures(user.id)
      const correctLimit = planFeatures.maxImagesPerMonth
      
      if (usage.imagesGenerated > correctLimit) {
        issues.push({
          email: user.email,
          currentUsage: usage.imagesGenerated,
          correctLimit: correctLimit,
          exceedBy: usage.imagesGenerated - correctLimit,
          planName: user.subscriptions[0]?.plan?.name || user.plan?.name || 'free'
        })
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalUsersChecked: allUsage.length,
        issuesFound: issues.length,
        month: currentMonth,
        year: currentYear
      },
      issues: issues,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Emergency check error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}