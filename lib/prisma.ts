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
  // 检查是否是有效的数据库URL（不是默认的占位符）
  return dbUrl &&
         dbUrl.trim() !== '' &&
         !dbUrl.includes('your-') &&
         !dbUrl.includes('password@localhost') &&
         dbUrl.startsWith('postgresql://')
}

// 创建Prisma客户端，如果数据库未配置或在客户端则返回null
export const prisma = globalForPrisma.prisma ?? (() => {
  try {
    // 在客户端不初始化Prisma客户端
    if (!isServerSide) {
      return null
    }

    if (!isDatabaseConfigured()) {
      console.warn('⚠️  数据库未配置，请检查 DATABASE_URL 环境变量')
      return null
    }

    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  } catch (error) {
    console.error('❌ Prisma客户端初始化失败:', error)
    return null
  }
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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
