import { NextRequest, NextResponse } from 'next/server'
import { createPrismaClient } from '@/lib/prisma'
import { getUserPlanFeatures } from '@/lib/subscription'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 🔐 检查管理员权限
    const adminSecret = request.headers.get('x-admin-secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
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

    console.log('🔍 开始智能修复历史使用量数据...')

    // 获取所有用户的当月使用情况和实际生成记录
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
            },
            // 包含实际的生成记录
            images: {
              where: {
                createdAt: {
                  gte: new Date(currentYear, currentMonth - 1, 1), // 当月第一天
                  lt: new Date(currentYear, currentMonth, 1) // 下月第一天
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

    const issues = []
    const fixes = []

    console.log(`📊 检查${allUsage.length}个用户的使用情况...`)

    // 智能分析每个用户的实际使用情况
    for (const usage of allUsage) {
      const user = usage.user
      if (!user) continue

      // 获取用户的正确套餐限制
      const planFeatures = await getUserPlanFeatures(user.id)
      const correctLimit = planFeatures.maxImagesPerMonth
      
      // 🔍 关键：基于实际生成记录计算真实使用量
      const actualGeneratedCount = user.images?.length || 0
      const recordedUsage = usage.imagesGenerated

      console.log(`📋 用户分析: ${user.email}`)
      console.log(`   数据库记录使用量: ${recordedUsage}`)
      console.log(`   实际生成图片数量: ${actualGeneratedCount}`)
      console.log(`   套餐限制: ${correctLimit}`)

      // 检查是否存在数据不一致
      let needsFix = false
      let fixMethod = ''
      let newUsage = recordedUsage

      if (recordedUsage > correctLimit) {
        // 情况1：记录的使用量超过了套餐限制（不可能的情况）
        needsFix = true
        
        if (actualGeneratedCount <= correctLimit) {
          // 实际生成数量在限制内，使用实际数量
          newUsage = actualGeneratedCount
          fixMethod = '基于实际生成记录修正'
        } else {
          // 实际生成也超限（可能是历史问题），重置为限制
          newUsage = correctLimit
          fixMethod = '重置为套餐限制'
        }
      } else if (Math.abs(recordedUsage - actualGeneratedCount) > 1) {
        // 情况2：记录使用量与实际生成数量差异过大（可能是双重计数）
        needsFix = true
        newUsage = Math.min(actualGeneratedCount, correctLimit)
        fixMethod = '基于实际生成记录重新计算'
      }

      if (needsFix) {
        issues.push({
          userId: user.id,
          email: user.email,
          recordedUsage: recordedUsage,
          actualGenerated: actualGeneratedCount,
          correctLimit: correctLimit,
          planName: user.subscriptions[0]?.plan?.name || user.plan?.name || 'free',
          issue: `Recorded: ${recordedUsage}, Actual: ${actualGeneratedCount}, Limit: ${correctLimit}`
        })

        // 🔧 执行智能修复
        console.log(`🔧 修复用户 ${user.email}: ${recordedUsage} → ${newUsage}`)
        
        await prisma.userUsage.update({
          where: { id: usage.id },
          data: { 
            imagesGenerated: newUsage,
            updatedAt: new Date()
          }
        })

        fixes.push({
          userId: user.id,
          email: user.email,
          oldUsage: recordedUsage,
          actualGenerated: actualGeneratedCount,
          newUsage: newUsage,
          limit: correctLimit,
          method: fixMethod
        })

        console.log(`✅ 用户 ${user.email} 修复完成`)
      }
    }

    console.log(`🎉 智能修复完成: 发现${issues.length}个问题，修复${fixes.length}个用户`)

    return NextResponse.json({
      success: true,
      method: 'smart_fix',
      summary: {
        totalUsersChecked: allUsage.length,
        issuesFound: issues.length,
        fixesApplied: fixes.length,
        month: currentMonth,
        year: currentYear
      },
      issues: issues,
      fixes: fixes,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Smart fix usage data error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET 方法用于预览会进行哪些修复
export async function GET(request: NextRequest) {
  try {
    // 🔐 检查管理员权限
    const adminSecret = request.headers.get('x-admin-secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
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

    // 获取所有用户的当月使用情况和实际生成记录
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
            },
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

    const previewFixes = []

    // 预览会进行哪些修复
    for (const usage of allUsage) {
      const user = usage.user
      if (!user) continue

      const planFeatures = await getUserPlanFeatures(user.id)
      const correctLimit = planFeatures.maxImagesPerMonth
      const actualGeneratedCount = user.images?.length || 0
      const recordedUsage = usage.imagesGenerated

      let needsFix = false
      let fixMethod = ''
      let newUsage = recordedUsage

      if (recordedUsage > correctLimit) {
        needsFix = true
        if (actualGeneratedCount <= correctLimit) {
          newUsage = actualGeneratedCount
          fixMethod = '基于实际生成记录修正'
        } else {
          newUsage = correctLimit
          fixMethod = '重置为套餐限制'
        }
      } else if (Math.abs(recordedUsage - actualGeneratedCount) > 1) {
        needsFix = true
        newUsage = Math.min(actualGeneratedCount, correctLimit)
        fixMethod = '基于实际生成记录重新计算'
      }

      if (needsFix) {
        previewFixes.push({
          email: user.email,
          currentUsage: recordedUsage,
          actualGenerated: actualGeneratedCount,
          plannedNewUsage: newUsage,
          limit: correctLimit,
          method: fixMethod,
          planName: user.subscriptions[0]?.plan?.name || user.plan?.name || 'free'
        })
      }
    }

    return NextResponse.json({
      success: true,
      method: 'smart_fix_preview',
      summary: {
        totalUsersChecked: allUsage.length,
        plannedFixes: previewFixes.length,
        month: currentMonth,
        year: currentYear
      },
      plannedFixes: previewFixes,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Preview smart fix error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}