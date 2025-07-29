import { NextRequest, NextResponse } from 'next/server'
import { createPrismaClient } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const prisma = createPrismaClient()
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    // 查找用户并检查邮箱验证状态
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        password: true
      }
    })

    if (!user) {
      return NextResponse.json({
        exists: false,
        emailVerified: false
      })
    }

    return NextResponse.json({
      exists: true,
      emailVerified: !!user.emailVerified,
      hasPassword: !!user.password
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ 检查邮箱状态失败:', errorMessage)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}