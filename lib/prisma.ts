import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

// 检查是否在服务器端运行
const isServerSide = typeof window === 'undefined'

// 检查DATABASE_URL是否有效
const isDatabaseConfigured = () => {
  // 在客户端直接返回false
  if (!isServerSide) return false

  const dbUrl = process.env.DATABASE_URL
  console.log('🔍 数据库配置检查:', {
    存在: !!dbUrl,
    长度: dbUrl?.length || 0,
    前缀: dbUrl?.substring(0, 20) + '...',
    是否占位符: dbUrl?.includes('your-') || false
  })
  
  // 检查是否是有效的数据库URL（不是默认的占位符）
  const isValid = dbUrl &&
         dbUrl.trim() !== '' &&
         !dbUrl.includes('your-') &&
         !dbUrl.includes('password@localhost') &&
         (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))
  
  console.log('数据库配置结果:', isValid ? '✅ 有效' : '❌ 无效')
  return isValid
}

// 🎯 创建数据库客户端工厂函数，彻底解决prepared statement问题
export function createPrismaClient() {
  try {
    // 在客户端不初始化Prisma客户端
    if (!isServerSide) {
      return null
    }

    if (!isDatabaseConfigured()) {
      console.warn('⚠️  数据库未配置，请检查 DATABASE_URL 环境变量')
      return null
    }

    // 🔥 开发环境中禁用prepared statements避免冲突
    let connectionUrl = process.env.DATABASE_URL!
    if (process.env.NODE_ENV === 'development') {
      // 在开发环境中添加pgbouncer参数禁用prepared statements
      const separator = connectionUrl.includes('?') ? '&' : '?'
      connectionUrl = `${connectionUrl}${separator}prepared_statements=false`
    }

    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
      errorFormat: 'minimal',
    })

    // 🔥 开发环境中每次使用后自动断开连接
    if (process.env.NODE_ENV === 'development') {
      const originalClient = client
      // 包装客户端，在操作后自动断开
      return new Proxy(originalClient, {
        get(target, prop) {
          const value = target[prop as keyof typeof target]
          
          // 如果是Prisma的模型操作方法，包装它们
          if (prop === 'user' || prop === 'plan' || prop === 'subscription' || prop === 'userUsage') {
            return new Proxy(value, {
              get(modelTarget, modelProp) {
                const modelValue = modelTarget[modelProp as keyof typeof modelTarget]
                
                if (typeof modelValue === 'function') {
                  return async function(...args: unknown[]) {
                    try {
                      const result = await (modelValue as (...args: unknown[]) => unknown).apply(modelTarget, args)
                      return result
                    } finally {
                      // 操作完成后断开连接
                      setTimeout(() => {
                        originalClient.$disconnect().catch(() => {})
                      }, 100)
                    }
                  }
                }
                
                return modelValue
              }
            })
          }
          
          return value
        }
      })
    }

    return client
  } catch (error) {
    console.error('❌ Prisma客户端创建失败:', error)
    return null
  }
}

// 为向后兼容保留原有导出，但使用新的创建方式
export const prisma = (() => {
  // 在开发环境中，每次都创建新实例避免prepared statement冲突
  if (process.env.NODE_ENV === 'development') {
    return createPrismaClient()
  }
  
  // 生产环境使用缓存实例
  return globalForPrisma.prisma ?? (() => {
    const client = createPrismaClient()
    globalForPrisma.prisma = client
    return client
  })()
})()

// 🎯 在开发环境中不缓存连接，避免prepared statement冲突
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 数据库连接健康检查（仅服务器端）
export async function checkDatabaseConnection() {
  try {
    // 在客户端不执行数据库检查
    if (!isServerSide) {
      return false
    }

    if (!prisma) {
      console.warn('⚠️  数据库客户端未初始化')
      return false
    }

    await prisma.$queryRaw`SELECT 1`
    console.log('✅ 数据库连接正常')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

// 优雅关闭数据库连接（仅服务器端）
if (isServerSide) {
  process.on('beforeExit', async () => {
    if (prisma) {
      await prisma.$disconnect()
    }
  })
}
