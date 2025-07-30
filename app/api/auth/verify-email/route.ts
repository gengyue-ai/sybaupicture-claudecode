import { NextRequest, NextResponse } from 'next/server'
import { createPrismaClient } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'
import { SignJWT } from 'jose'

// 验证邮箱地址
export async function GET(request: NextRequest) {
  console.log('🔄 开始处理邮箱验证请求')
  
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    console.log('📧 验证参数:', { email, token: token?.substring(0, 10) + '...' })

    if (!token || !email) {
      console.error('❌ 缺少必要参数')
      return NextResponse.json(
        { 
          error: 'Missing token or email',
          message: '缺少验证令牌或邮箱地址',
          code: 'MISSING_PARAMETERS'
        },
        { status: 400 }
      )
    }

    const prisma = createPrismaClient()
    if (!prisma) {
      console.error('❌ 数据库连接不可用')
      return NextResponse.json(
        { 
          error: 'Database connection not available',
          code: 'DB_CONNECTION_ERROR'
        },
        { status: 500 }
      )
    }

    // 查找用户并验证token
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        verificationToken: true,
        verificationTokenExpiry: true,
        emailVerified: true
      }
    })

    if (!user) {
      console.error('❌ 用户不存在:', email)
      return NextResponse.json(
        { 
          error: 'User not found',
          message: '用户不存在',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // 检查用户是否已经验证过
    if (user.emailVerified) {
      console.log('✅ 用户邮箱已验证:', email)
      
      try {
        // 已验证用户也自动登录
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-dev-secret')
        
        const payload = {
          sub: user.id,
          email: user.email,
          name: user.name,
          picture: user.image,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        }

        const token = await new SignJWT(payload)
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('30d')
          .sign(secret)

        const response = NextResponse.redirect(new URL('/', request.url))
        
        response.cookies.set('next-auth.session-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
          path: '/'
        })

        console.log('✅ 已验证用户自动登录')
        return response

      } catch (sessionError) {
        console.error('❌ 已验证用户登录会话创建失败:', sessionError)
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // 验证token
    if (!user.verificationToken || user.verificationToken !== token) {
      console.error('❌ 验证令牌无效:', { 
        hasToken: !!user.verificationToken,
        tokenMatches: user.verificationToken === token
      })
      return NextResponse.json(
        { 
          error: 'Invalid verification token',
          message: '验证令牌无效',
          code: 'INVALID_TOKEN'
        },
        { status: 400 }
      )
    }

    // 检查token是否过期
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      console.error('❌ 验证令牌已过期:', user.verificationTokenExpiry)
      return NextResponse.json(
        { 
          error: 'Verification token expired',
          message: '验证令牌已过期',
          code: 'TOKEN_EXPIRED'
        },
        { status: 400 }
      )
    }

    // 更新用户状态 - 标记邮箱已验证
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null
      }
    })

    console.log('✅ 邮箱验证成功:', email)

    try {
      // 创建JWT token为用户自动登录
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-dev-secret')
      
      // 构建JWT payload
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.image,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30天过期
      }

      // 创建JWT token
      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(secret)

      // 创建重定向响应到首页
      const response = NextResponse.redirect(new URL('/', request.url))
      
      // 设置NextAuth session cookie
      response.cookies.set('next-auth.session-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30天
        path: '/'
      })

      console.log('✅ 已创建登录会话，用户将自动登录')
      return response

    } catch (sessionError) {
      console.error('❌ 创建登录会话失败:', sessionError)
      // 降级处理：重定向到登录页面
      const loginUrl = `/auth/signin?verified=true&email=${encodeURIComponent(email)}`
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ 邮箱验证过程中发生错误:', errorMessage)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// 重新发送验证邮件
export async function POST(request: NextRequest) {
  console.log('🔄 开始处理重新发送验证邮件请求')
  
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          message: '邮箱地址是必需的',
          code: 'MISSING_EMAIL'
        },
        { status: 400 }
      )
    }

    const prisma = createPrismaClient()
    if (!prisma) {
      return NextResponse.json(
        { 
          error: 'Database connection not available',
          code: 'DB_CONNECTION_ERROR'
        },
        { status: 500 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          message: '用户不存在',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // 检查是否已验证
    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: '邮箱已验证，无需重新发送',
          code: 'ALREADY_VERIFIED'
        },
        { status: 200 }
      )
    }

    // 生成新的验证token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 更新用户的验证token
    await prisma.user.update({
      where: { email },
      data: {
        verificationToken,
        verificationTokenExpiry
      }
    })

    // 发送验证邮件
    const emailResult = await sendVerificationEmail({
      email,
      token: verificationToken,
      locale: request.headers.get('Accept-Language')?.includes('zh') ? 'zh' : 'en'
    })

    if (!emailResult.success) {
      console.error('❌ 邮件发送失败:', emailResult.error)
      return NextResponse.json(
        { 
          error: 'Failed to send verification email',
          message: '验证邮件发送失败',
          code: 'EMAIL_SEND_FAILED'
        },
        { status: 500 }
      )
    }

    console.log('✅ 验证邮件重新发送成功:', email)

    return NextResponse.json(
      {
        success: true,
        message: '验证邮件已重新发送',
        code: 'EMAIL_RESENT'
      },
      { status: 200 }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ 重新发送验证邮件过程中发生错误:', errorMessage)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}