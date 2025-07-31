import { NextRequest, NextResponse } from 'next/server'
import { createPrismaClient } from '@/lib/prisma'
import { config } from '@/lib/config'

/**
 * 健康检查API端点
 * 创建时间: 2025-07-31
 * 
 * 功能:
 * - 检查应用基本状态
 * - 验证数据库连接
 * - 检查关键配置
 * - 验证第三方服务配置
 */

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: 'connected' | 'disconnected' | 'error'
    auth: {
      nextauth: boolean
      google: boolean
    }
    payment: {
      stripe: boolean
    }
    ai: {
      fal: boolean
    }
    environment: {
      node_env: string
      deployment_env: 'development' | 'production'
    }
  }
  details?: {
    database?: any
    errors?: string[]
  }
}

// 检查数据库连接
async function checkDatabase() {
  try {
    const prisma = createPrismaClient()
    if (!prisma) {
      return { status: 'disconnected', error: 'Prisma client not available' }
    }

    // 简单的数据库连接测试
    await prisma.$queryRaw`SELECT 1`
    return { status: 'connected' }
  } catch (error) {
    console.error('数据库健康检查失败:', error)
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    }
  }
}

// 检查认证配置
function checkAuthConfig() {
  return {
    nextauth: Boolean(process.env.NEXTAUTH_SECRET),
    google: Boolean(config.auth.google.clientId && config.auth.google.clientSecret)
  }
}

// 检查支付配置
function checkPaymentConfig() {
  return {
    stripe: Boolean(config.stripe.secretKey && config.stripe.publishableKey)
  }
}

// 检查AI服务配置
function checkAIConfig() {
  return {
    fal: Boolean(process.env.FAL_KEY)
  }
}

// 检查环境配置
function checkEnvironment() {
  return {
    node_env: process.env.NODE_ENV || 'unknown',
    deployment_env: config.environment.current
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 执行各项健康检查
    const dbCheck = await checkDatabase()
    const authCheck = checkAuthConfig()
    const paymentCheck = checkPaymentConfig()
    const aiCheck = checkAIConfig()
    const envCheck = checkEnvironment()
    
    // 计算整体健康状态
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    const errors: string[] = []
    
    // 数据库连接是关键检查
    if (dbCheck.status === 'error') {
      status = 'unhealthy'
      errors.push(`数据库连接失败: ${dbCheck.error}`)
    } else if (dbCheck.status === 'disconnected') {
      status = 'degraded'
      errors.push('数据库连接不可用')
    }
    
    // 关键服务配置检查
    if (!authCheck.nextauth) {
      status = status === 'healthy' ? 'degraded' : status
      errors.push('NextAuth secret未配置')
    }
    
    if (!authCheck.google) {
      status = status === 'healthy' ? 'degraded' : status
      errors.push('Google OAuth未配置')
    }
    
    if (!paymentCheck.stripe) {
      status = status === 'healthy' ? 'degraded' : status
      errors.push('Stripe支付未配置')
    }
    
    if (!aiCheck.fal) {
      status = status === 'healthy' ? 'degraded' : status
      errors.push('Fal AI服务未配置')
    }
    
    const responseTime = Date.now() - startTime
    
    const healthResult: HealthCheckResult = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: dbCheck.status,
        auth: authCheck,
        payment: paymentCheck,
        ai: aiCheck,
        environment: envCheck
      }
    }
    
    // 添加详细信息
    if (errors.length > 0) {
      healthResult.details = {
        errors,
        database: dbCheck.error ? { error: dbCheck.error } : undefined
      }
    }
    
    // 根据健康状态返回相应的HTTP状态码
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503
    
    // 添加响应头
    const response = NextResponse.json(healthResult, { status: httpStatus })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('X-Health-Check', 'true')
    response.headers.set('X-Response-Time', `${responseTime}ms`)
    
    return response
    
  } catch (error) {
    console.error('健康检查API执行失败:', error)
    
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: 'error',
        auth: { nextauth: false, google: false },
        payment: { stripe: false },
        ai: { fal: false },
        environment: {
          node_env: process.env.NODE_ENV || 'unknown',
          deployment_env: 'production'
        }
      },
      details: {
        errors: [error instanceof Error ? error.message : 'Unknown health check error']
      }
    }
    
    return NextResponse.json(errorResult, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    })
  }
}

// 支持HEAD请求用于简单的活跃检查
export async function HEAD(request: NextRequest) {
  try {
    // 简单的数据库ping检查
    const prisma = createPrismaClient()
    if (prisma) {
      await prisma.$queryRaw`SELECT 1`
    }
    
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true'
      }
    })
  } catch (error) {
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true'
      }
    })
  }
}