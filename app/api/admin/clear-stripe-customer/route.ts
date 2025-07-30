import { NextRequest, NextResponse } from 'next/server'
import { createPrismaClient } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const prisma = createPrismaClient()
  
  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, stripeCustomerId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 清除Stripe客户ID，让系统在测试环境下创建新的客户ID
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        stripeCustomerId: null 
      },
      select: { id: true, email: true, stripeCustomerId: true }
    })

    console.log(`✅ 已清除用户 ${email} 的Stripe客户ID`)

    return NextResponse.json({
      success: true,
      message: `已清除用户 ${email} 的Stripe客户ID，现在可以在测试环境下使用`,
      user: updatedUser
    })

  } catch (error) {
    console.error('❌ 清除Stripe客户ID失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}