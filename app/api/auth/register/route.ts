import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { createPrismaClient } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { DatabaseError } from '@/types'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`🔄 [${requestId}] 开始处理用户注册请求`, {
    环境: process.env.NODE_ENV,
    时间: new Date().toISOString(),
    userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...'
  })
  
  try {
    let requestData
    try {
      requestData = await request.json()
    } catch (parseError) {
      console.error(`❌ [${requestId}] JSON解析失败:`, parseError)
      return NextResponse.json(
        { 
          error: 'Invalid JSON format',
          code: 'JSON_PARSE_ERROR',
          requestId 
        },
        { status: 400 }
      )
    }

    const { name, email, password } = requestData
    console.log(`📝 [${requestId}] 注册数据:`, { 
      name: name?.substring(0, 10) + '...', 
      email: email?.substring(0, 10) + '...', 
      passwordLength: password?.length,
      环境: process.env.NODE_ENV
    })

    // 基本验证
    if (!name || !email || !password) {
      console.error('❌ 缺少必填字段')
      return NextResponse.json(
        { 
          error: 'Name, email and password are required',
          message: '请填写完整的姓名、邮箱和密码',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.error('❌ 密码长度不足')
      return NextResponse.json(
        { 
          error: 'Password must be at least 6 characters',
          message: '密码至少需要6位字符',
          code: 'PASSWORD_TOO_SHORT'
        },
        { status: 400 }
      )
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('❌ 邮箱格式无效:', email)
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          message: '请输入有效的邮箱地址',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      )
    }

    // 🎯 创建数据库连接
    const prisma = createPrismaClient()
    if (!prisma) {
      return NextResponse.json(
        { 
          error: 'Database connection not available',
          details: 'Database service temporarily unavailable',
          code: 'DB_CONNECTION_ERROR',
          requestId
        },
        { status: 500 }
      )
    }

    console.log(`🔍 [${requestId}] 开始用户查询: ${email}`)
    
    // 🎯 简化的用户查询逻辑
    let existingUser
    try {
      console.log(`🔍 [${requestId}] 查询现有用户...`)
      
      existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      console.log(`✅ [${requestId}] 用户查询成功:`, {
        用户存在: !!existingUser,
        用户ID: existingUser?.id?.substring(0, 8) + '...' || 'N/A'
      })
    } catch (dbError: unknown) {
      const error = dbError as DatabaseError
      
      console.error(`❌ [${requestId}] 用户查询失败:`, {
        错误信息: error.message,
        错误代码: error.code,
        错误类型: error.constructor?.name
      })
      
      return NextResponse.json(
        { 
          error: 'Database query failed',
          details: process.env.NODE_ENV === 'production'
            ? 'Unable to process your request. Please try again later.'
            : `Query error: ${error.message}`,
          code: 'DB_QUERY_ERROR',
          requestId,
          debug: process.env.NODE_ENV === 'development' ? {
            errorMessage: error.message,
            errorCode: error.code,
            errorType: error.constructor?.name
          } : undefined
        },
        { status: 500 }
      )
    }

    if (existingUser) {
      console.log('🔍 发现现有用户，分析账户类型:', { 
        email, 
        hasPassword: !!existingUser.password,
        provider: existingUser.provider || 'unknown'
      })
      
      // 🎯 智能账户合并逻辑 - 参考ShipAny设计
      
      // 情况1：OAuth用户尝试邮箱注册 - 为现有账户添加密码
      if (!existingUser.password && existingUser.provider) {
        console.log('✨ OAuth用户请求添加密码登录功能')
        
        try {
          // 为OAuth账户添加密码功能
          const hashedPassword = await bcrypt.hash(password, 12)
          
          await prisma.user.update({
            where: { email },
            data: { 
              password: hashedPassword,
              name: name.trim() // 更新姓名（如果提供）
            }
          })
          
          console.log('✅ 成功为OAuth账户添加密码功能')
          
          return NextResponse.json({
            success: true,
            message: '密码已添加到您的账户',
            code: 'PASSWORD_ADDED_TO_OAUTH',
            action: 'account_enhanced',
            details: `您现在可以使用 ${existingUser.provider} 或邮箱密码登录`,
            user: {
              id: existingUser.id,
              email: existingUser.email,
              name: name.trim(),
              provider: existingUser.provider
            }
          })
          
        } catch (enhanceError: unknown) {
          const error = enhanceError instanceof Error ? enhanceError : new Error('Unknown error')
          console.error('❌ 为OAuth账户添加密码失败:', error.message)
          return NextResponse.json(
            { 
              error: 'Failed to enhance account',
              details: 'Unable to add password to your OAuth account. Please try again.',
              code: 'ACCOUNT_ENHANCE_ERROR'
            },
            { status: 500 }
          )
        }
      }
      
      // 情况2：邮箱用户重复注册 - 引导登录
      else {
        console.log('⚠️ 邮箱用户重复注册，引导登录')
        return NextResponse.json(
          { 
            error: 'User already exists',
            message: '该邮箱已注册，请直接登录',
            code: 'USER_EXISTS',
            action: 'redirect_to_login',
            hasPassword: !!existingUser.password
          },
          { status: 422 }
        )
      }
    }

    console.log('🔐 开始密码加密...')
    
    // 密码加密
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 12)
      console.log('✅ 密码加密成功')
    } catch (hashError) {
      console.error('❌ 密码加密失败:', hashError)
      return NextResponse.json(
        { error: 'Password encryption failed' },
        { status: 500 }
      )
    }

    console.log('👤 创建新用户...')
    
    // 生成邮箱验证token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
    
    // 🎯 简化的用户创建逻辑
    let user: Record<string, unknown> | null = null
    
    try {
      console.log(`👤 [${requestId}] 创建新用户...`)
      
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          planId: 'free', // 默认免费套餐
          verificationToken,
          verificationTokenExpiry,
          // 邮箱注册用户需要验证邮箱
          emailVerified: null,
        },
      })
      
      console.log(`✅ [${requestId}] 新用户创建成功:`, { 
        id: user.id, 
        email, 
        name 
      })
    } catch (createError: unknown) {
      const error = createError as DatabaseError
      
      console.error(`❌ [${requestId}] 用户创建失败:`, {
        错误信息: error.message,
        错误代码: error.code,
        错误类型: error.constructor?.name
      })
      
      // 提供具体的错误信息
      let errorMessage = 'Failed to create user account'
      let errorDetails = 'An error occurred while creating your account. Please try again.'
      
      if (error.code === 'P2002') {
        errorMessage = 'User already exists'
        errorDetails = 'An account with this email already exists.'
      } else if (error.code === 'P1001' || error.message?.includes('connect')) {
        errorMessage = 'Database connection failed'
        errorDetails = 'Unable to connect to the database. Please try again later.'
      } else if (error.code === 'P2003') {
        errorMessage = 'Invalid data'
        errorDetails = 'The provided data is invalid. Please check your information.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          code: 'USER_CREATE_ERROR',
          requestId,
          debug: process.env.NODE_ENV === 'development' ? {
            errorMessage: error.message,
            errorCode: error.code,
            errorType: error.constructor?.name
          } : undefined
        },
        { status: 500 }
      )
    }

    console.log('✅ 用户注册流程完成')

    // 确保用户创建成功
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User creation failed',
          details: 'Unable to create user after all retry attempts',
          code: 'USER_CREATE_FAILED'
        },
        { status: 500 }
      )
    }

    // 发送验证邮件
    console.log('📧 发送邮箱验证邮件...')
    const locale = request.headers.get('Accept-Language')?.includes('zh') ? 'zh' : 'en'
    
    try {
      const emailResult = await sendVerificationEmail({
        email,
        token: verificationToken,
        locale
      })

      if (emailResult.success) {
        console.log('✅ 验证邮件发送成功:', emailResult.id)
      } else {
        console.warn('⚠️ 验证邮件发送失败，但不影响注册:', emailResult.error)
      }
    } catch (emailError) {
      console.warn('⚠️ 验证邮件发送异常，但不影响注册:', emailError)
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully. Please check your email to verify your account.',
        emailSent: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
      { status: 201 }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ [${requestId}] 用户注册未预期错误:`, {
      错误信息: errorMessage,
      错误堆栈: error instanceof Error ? error.stack?.substring(0, 500) + '...' : undefined,
      错误原因: error instanceof Error ? error.cause : undefined,
      错误类型: error?.constructor?.name,
      环境: process.env.NODE_ENV,
      时间: new Date().toISOString()
    })
    
    // 🎯 生产环境安全的错误响应
    const responseError = process.env.NODE_ENV === 'production' 
      ? 'Registration service temporarily unavailable. Please try again later.'
      : `Internal server error: ${errorMessage}`
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: responseError,
        code: 'INTERNAL_SERVER_ERROR',
        requestId,
        debug: process.env.NODE_ENV === 'development' ? {
          message: errorMessage,
          type: error?.constructor?.name,
          stack: error instanceof Error ? error.stack?.substring(0, 200) + '...' : undefined
        } : undefined
      },
      { status: 500 }
    )
  }
}