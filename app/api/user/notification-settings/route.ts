import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createPrismaClient } from '@/lib/prisma'

// 强制动态渲染，因为我们使用了headers
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const prisma = createPrismaClient()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // 获取用户通知设置
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        emailNotifications: true,
        smsNotifications: true,
        marketingEmails: true,
        subscriptionUpdates: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        emailNewsletter: user.marketingEmails || false,
        emailPromotions: user.marketingEmails || false,
        emailUpdates: user.subscriptionUpdates || false,
        pushNotifications: user.emailNotifications || false,
        smsNotifications: user.smsNotifications || false
      }
    })

  } catch (error: any) {
    console.error('❌ 获取通知设置失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const prisma = createPrismaClient()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const { setting, value } = await request.json()

    if (!setting || typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Invalid setting or value' }, { status: 400 })
    }

    // 映射前端设置到数据库字段
    const settingMap: { [key: string]: string } = {
      emailNewsletter: 'marketingEmails',
      emailPromotions: 'marketingEmails',
      emailUpdates: 'subscriptionUpdates',
      pushNotifications: 'emailNotifications',
      smsNotifications: 'smsNotifications'
    }

    const dbField = settingMap[setting]
    if (!dbField) {
      return NextResponse.json({ error: 'Unknown setting' }, { status: 400 })
    }

    // 更新用户设置
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        [dbField]: value
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification setting updated successfully'
    })

  } catch (error: any) {
    console.error('❌ 更新通知设置失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}