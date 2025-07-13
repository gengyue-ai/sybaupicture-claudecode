import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: '请先登录'
      }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: '数据库连接失败'
      }, { status: 500 })
    }

    console.log('开始刷新用户会话:', session.user.email)

    // 获取用户的Google访问令牌
    const userAccount = await prisma.account.findFirst({
      where: {
        user: {
          email: session.user.email
        },
        provider: 'google'
      }
    })

    if (!userAccount || !userAccount.access_token) {
      return NextResponse.json({
        success: false,
        error: '未找到Google访问令牌'
      }, { status: 400 })
    }

    // 从Google获取最新用户信息
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${userAccount.access_token}`
      }
    })

    if (!googleResponse.ok) {
      return NextResponse.json({
        success: false,
        error: '获取Google用户信息失败'
      }, { status: 400 })
    }

    const googleUserInfo = await googleResponse.json()
    console.log('从Google获取到的最新用户信息:', {
      name: googleUserInfo.name,
      picture: googleUserInfo.picture,
      email: googleUserInfo.email
    })

    // 更新数据库中的用户信息
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: googleUserInfo.name,
        image: googleUserInfo.picture,
        updatedAt: new Date()
      }
    })

    console.log('✅ 数据库用户信息更新成功:', {
      email: updatedUser.email,
      name: updatedUser.name,
      image: updatedUser.image
    })

    console.log('✅ 用户信息刷新成功:', {
      oldImage: session.user.image,
      newImage: updatedUser.image
    })

    return NextResponse.json({
      success: true,
      message: '用户信息已刷新',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image
      }
    })

  } catch (error) {
    console.error('刷新用户会话失败:', error)
    return NextResponse.json({
      success: false,
      error: '刷新失败，请重试'
    }, { status: 500 })
  }
} 