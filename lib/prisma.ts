import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

// 检查是否在服务器端运行
const isServerSide = typeof window === 'undefined'

// 🎯 Vercel商用环境数据库配置检查
const isDatabaseConfigured = () => {
  if (!isServerSide) return null

  // Vercel + Supabase: 优先使用POSTGRES_PRISMA_URL
  const dbUrl = process.env.POSTGRES_PRISMA_URL || 
                process.env.DATABASE_URL || 
                process.env.POSTGRES_URL
  
  const isValid = dbUrl && 
                  dbUrl.trim() !== '' && 
                  (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))
  
  return { isValid, dbUrl }
}

// 🎯 创建数据库客户端工厂函数，支持开发和生产环境
export function createPrismaClient() {
  try {
    // 在客户端不初始化Prisma客户端
    if (!isServerSide) {
      return null
    }

    const dbConfig = isDatabaseConfigured()
    if (!dbConfig || !dbConfig.isValid) {
      return null
    }

    // 🎯 Vercel + Supabase 商用环境优化配置
    const isProduction = process.env.NODE_ENV === 'production'
    let connectionUrl = dbConfig.dbUrl!
    
    if (!isProduction) {
      // 开发环境：禁用prepared statements
      const separator = connectionUrl.includes('?') ? '&' : '?'
      connectionUrl = `${connectionUrl}${separator}prepared_statements=false`
    }
    
    // 生产环境直接使用配置好的URL，无需额外处理

    const client = new PrismaClient({
      log: isProduction ? ['error'] : ['error', 'warn'],
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
      errorFormat: 'minimal',
    })

    // 🎯 生产环境：使用持久连接
    if (isProduction) {
      return client
    }

    // 🔥 开发环境：每次使用后自动断开连接避免冲突
    const originalClient = client
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
                    // 开发环境操作完成后断开连接
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
