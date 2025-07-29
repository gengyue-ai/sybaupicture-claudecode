import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { createPrismaClient } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { DatabaseError } from '@/types'

export async function POST(request: NextRequest) {
  console.log('🔄 开始处理用户注册请求')
  
  try {
    let requestData
    try {
      requestData = await request.json()
    } catch (parseError) {
      console.error('❌ JSON解析失败:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    const { name, email, password } = requestData
    console.log('📝 注册数据:', { name, email, passwordLength: password?.length })

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

    // 🎯 为每个请求创建独立的数据库连接，避免prepared statement冲突
    const prisma = createPrismaClient()
    if (!prisma) {
      console.error('❌ 数据库连接不可用 - DATABASE_URL:', process.env.DATABASE_URL ? '已设置' : '未设置')
      console.error('❌ 环境变量详情:', {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
        DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) || 'undefined'
      })
      
      return NextResponse.json(
        { 
          error: 'Database connection not available',
          details: 'The database service is currently unavailable. Please try again later.',
          code: 'DB_CONNECTION_ERROR',
          debug: {
            databaseConfigured: !!process.env.DATABASE_URL,
            environment: process.env.NODE_ENV,
            databaseUrlLength: process.env.DATABASE_URL?.length || 0
          }
        },
        { status: 500 }
      )
    }

    console.log('🔍 检查用户是否已存在...')
    
    // 🎯 带重试机制的用户查询
    console.log('🔍 准备查询用户:', email)
    let existingUser
    let queryRetries = 0
    const maxQueryRetries = 3
    
    while (queryRetries < maxQueryRetries) {
      try {
        // 🎯 回到标准查询，但使用事务防止prepared statement冲突
        existingUser = await prisma.user.findUnique({
          where: { email }
        })
        existingUser = Array.isArray(existingUser) ? existingUser[0] : existingUser
        console.log('✅ 用户查询成功, 结果:', existingUser ? '用户已存在' : '用户不存在')
        break // 成功则跳出循环
      } catch (dbError: unknown) {
        const error = dbError as DatabaseError
        queryRetries++
        const isConnectionError = error.code === 'P1001' || 
                                error.code === 'P1017' || 
                                error.code === 'P1008' || 
                                error.message?.includes('connect') ||
                                error.message?.includes('timeout') ||
                                error.message?.includes('ETIMEDOUT')
        
        if (isConnectionError && queryRetries < maxQueryRetries) {
          const delay = 2000 * queryRetries // 递增延迟
          console.warn(`⚠️  数据库查询失败，${delay}ms后重试 (${queryRetries}/${maxQueryRetries})`, {
            错误信息: error.message,
            错误代码: error.code
          })
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // 最终失败或非连接错误
        console.error('❌ 数据库查询用户最终失败:', {
          错误信息: error.message,
          错误代码: error.code,
          错误类型: error.constructor?.name,
          重试次数: queryRetries,
          DATABASE_URL前缀: process.env.DATABASE_URL?.substring(0, 30) + '...'
        })
        return NextResponse.json(
          { 
            error: 'Database query failed',
            details: 'Failed to check if user exists after multiple attempts. Please try again later.',
            code: 'DB_QUERY_ERROR',
            debug: {
              errorMessage: error.message,
              errorCode: error.code,
              errorType: error.constructor?.name,
              retries: queryRetries
            }
          },
          { status: 500 }
        )
      }
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
    
    // 🎯 带重试机制的用户创建
    let user: Record<string, unknown> | null = null
    let createRetries = 0
    const maxCreateRetries = 3
    
    while (createRetries < maxCreateRetries) {
      try {
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
        console.log('✅ 新用户创建成功:', { id: user.id, email, name })
        break // 成功则跳出循环
      } catch (createError: unknown) {
        const error = createError as DatabaseError
        createRetries++
        const isConnectionError = error.code === 'P1001' || 
                                error.code === 'P1017' || 
                                error.code === 'P1008' || 
                                error.message?.includes('connect') ||
                                error.message?.includes('timeout') ||
                                error.message?.includes('ETIMEDOUT')
        
        if (isConnectionError && createRetries < maxCreateRetries) {
          const delay = 2000 * createRetries // 递增延迟
          console.warn(`⚠️  用户创建失败，${delay}ms后重试 (${createRetries}/${maxCreateRetries})`, {
            错误信息: error.message,
            错误代码: error.code
          })
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // 最终失败或非连接错误
        console.error('❌ 用户创建最终失败:', {
          错误信息: error.message,
          错误代码: error.code,
          重试次数: createRetries
        })
        
        // 提供更具体的错误信息
        let errorMessage = 'Failed to create user account'
        let errorDetails = 'An error occurred while creating your account. Please try again.'
        
        if (error.code === 'P2002') {
          errorMessage = 'User already exists'
          errorDetails = 'An account with this email already exists.'
        } else if (error.code === 'P1001' || isConnectionError) {
          errorMessage = 'Database connection failed'
          errorDetails = 'Unable to connect to the database after multiple attempts. Please try again later.'
        } else if (error.code === 'P2003') {
          errorMessage = 'Invalid data'
          errorDetails = 'The provided data is invalid. Please check your information.'
        }
        
        return NextResponse.json(
          { 
            error: errorMessage,
            details: errorDetails,
            code: 'USER_CREATE_ERROR',
            dbErrorCode: (createError as any)?.code,
            retries: createRetries
          },
          { status: 500 }
        )
      }
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
    console.error('❌ 用户注册未预期错误:', errorMessage)
    console.error('❌ 错误详情:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      },
      { status: 500 }
    )
  }
}