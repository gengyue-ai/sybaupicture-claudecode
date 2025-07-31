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

    // 获取所有用户的当月使用情况
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
    const fixes = []

    // 检查每个用户的使用情况
    for (const usage of allUsage) {
      const user = usage.user
      if (!user) continue

      // 获取用户的正确套餐限制
      const planFeatures = await getUserPlanFeatures(user.id)
      const correctLimit = planFeatures.maxImagesPerMonth
      
      // 检查是否超限
      if (usage.imagesGenerated > correctLimit) {
        issues.push({
          userId: user.id,
          email: user.email,
          currentUsage: usage.imagesGenerated,
          correctLimit: correctLimit,
          planName: user.subscriptions[0]?.plan?.name || user.plan?.name || 'free',
          issue: `User has ${usage.imagesGenerated} images but limit is ${correctLimit}`
        })

        // 🔧 修复选项1：重置为限制值
        await prisma.userUsage.update({
          where: { id: usage.id },
          data: { 
            imagesGenerated: Math.min(usage.imagesGenerated, correctLimit),
            updatedAt: new Date()
          }
        })

        fixes.push({
          userId: user.id,
          email: user.email,
          action: 'reset_to_limit',
          oldUsage: usage.imagesGenerated,
          newUsage: Math.min(usage.imagesGenerated, correctLimit),
          limit: correctLimit
        })
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalUsersChecked: allUsage.length,
        issuesFound: issues.length,
        fixesApplied: fixes.length
      },
      issues: issues,
      fixes: fixes,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Fix usage data error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET 方法用于检查问题但不修复
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

    // 获取所有用户的当月使用情况
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

    // 检查每个用户的使用情况
    for (const usage of allUsage) {
      const user = usage.user
      if (!user) continue

      // 获取用户的正确套餐限制
      const planFeatures = await getUserPlanFeatures(user.id)
      const correctLimit = planFeatures.maxImagesPerMonth
      
      // 检查是否超限
      if (usage.imagesGenerated > correctLimit) {
        issues.push({
          userId: user.id,
          email: user.email,
          currentUsage: usage.imagesGenerated,
          correctLimit: correctLimit,
          planName: user.subscriptions[0]?.plan?.name || user.plan?.name || 'free',
          issue: `User has ${usage.imagesGenerated} images but limit is ${correctLimit}`,
          exceedBy: usage.imagesGenerated - correctLimit
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
    console.error('Check usage data error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}