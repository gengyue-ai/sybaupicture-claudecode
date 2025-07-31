import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { config } from './config'
import { createPrismaClient } from './prisma'
import bcrypt from 'bcryptjs'
import { DatabaseError } from '@/types'

// 确保用户在数据库中存在（带重试机制）
async function ensureUserExists(userData: {
  email: string
  name: string
  image: string | null
}, maxRetries: number = 3) {
  // 🎯 创建独立的数据库连接，避免prepared statement冲突
  const prisma = createPrismaClient()
  if (!prisma) {
    console.warn('⚠️ 数据库不可用，跳过用户创建')
    return null
  }

  // 🔧 增强错误处理：检查数据库连接状态
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ 数据库连接正常')
  } catch (connectionError) {
    console.error('❌ 数据库连接测试失败:', connectionError)
    return null
  }

  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Attempting user sync
      
      // 查找或创建用户
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          image: userData.image,
          updatedAt: new Date()
        },
        create: {
          email: userData.email,
          name: userData.name,
          image: userData.image,
          planId: 'free', // 默认免费套餐
        },
        include: {
          plan: true,
          subscriptions: {
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
        }
      })

      // User sync successful

      return user
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`❌ 用户创建/更新失败 (尝试 ${attempt}/${maxRetries}):`, {
        email: userData.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code
      })
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // 指数退避，最大5秒
        // Retrying after delay
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }
  
  // 所有重试都失败了
  console.error('❌ 用户创建/更新彻底失败，已达到最大重试次数:', {
    email: userData.email,
    maxRetries,
    lastError: lastError?.message
  })
  
  // 不抛出错误，允许登录继续（降级处理）
  return null
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider - 邮箱密码登录
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 开始Credentials授权验证')
        
        if (!credentials?.email || !credentials?.password) {
          console.error('❌ 缺少邮箱或密码')
          return null
        }

        console.log('📧 验证用户:', credentials.email)

        try {
          // 🎯 创建独立的数据库连接，避免prepared statement冲突
          const prisma = createPrismaClient()
          if (!prisma) {
            console.error('❌ Prisma数据库连接不可用')
            return null
          }

          console.log('🔍 查找用户在数据库中...')
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              plan: true,
              subscriptions: {
                where: { status: 'active' },
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          })

          if (!user) {
            console.error('❌ 用户不存在:', credentials.email)
            return null
          }

          if (!user.password) {
            console.error('❌ 用户没有设置密码(可能是Google用户):', credentials.email)
            return null
          }

          // 🔥 邮箱验证检查 - 未验证邮箱的用户不能登录
          if (!user.emailVerified && user.password) {
            console.error('❌ 用户邮箱未验证，不允许登录:', credentials.email)
            // 返回特殊错误，前端可以识别并引导用户验证邮箱
            return null
          }

          console.log('🔍 验证密码...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            console.error('❌ 密码验证失败:', credentials.email)
            return null
          }

          console.log('✅ 用户验证成功:', { id: user.id, email: user.email, name: user.name })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error: unknown) {
          console.error('❌ Credentials授权过程中发生错误:', error)
          console.error('❌ 错误详情:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          })
          return null
        }
      },
    }),

    // Google OAuth Provider - 仅在配置完整时启用
    ...(config.auth.google.clientId && config.auth.google.clientSecret ? [
      GoogleProvider({
        clientId: config.auth.google.clientId,
        clientSecret: config.auth.google.clientSecret,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : [])
  ],

  secret: process.env.NEXTAUTH_SECRET || 'fallback-dev-secret',
  
  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false
      
      try {
        // 🔧 防止OAuth重复登录：检查是否已经在处理中
        if (account?.provider === 'google') {
          console.log('🔐 Google OAuth登录开始:', { 
            email: user.email, 
            provider: account.provider,
            type: account.type 
          })
        }
        
        // 确保用户在数据库中存在
        await ensureUserExists({
          email: user.email,
          name: user.name || '',
          image: user.image || null
        })
        
        console.log('✅ 用户登录成功:', { email: user.email, provider: account?.provider })
        return true
      } catch (error) {
        console.error('❌ 用户创建失败:', error)
        // 即使数据库操作失败，也允许登录
        return true
      }
    },
    async redirect({ url, baseUrl }) {
      // 🔧 修复重定向逻辑：确保用户能正常返回首页
      // Redirect callback
      
      // 如果是相对URL，直接拼接baseUrl
      if (url.startsWith('/')) {
        const redirectUrl = baseUrl + url
        // Relative URL redirect
        return redirectUrl
      }
      
      // 如果是完整URL且是同域名，允许重定向
      if (url.startsWith(baseUrl)) {
        // Same domain redirect
        return url
      }
      
      // 默认重定向到首页
      // Default redirect to home
      return baseUrl
    },

    async jwt({ token, user, account }) {
      // 初次登录时获取用户完整信息
      // 🎯 创建独立的数据库连接，避免prepared statement冲突
      const prisma = createPrismaClient()
      if (user && account && prisma) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        
        try {
          // 获取用户套餐信息
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
              plan: true,
              subscriptions: {
                where: { status: 'active' },
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          })
          
          if (dbUser) {
            token.planId = dbUser.planId
            token.subscriptionPlan = dbUser.plan?.name || 'free'
            token.isSubscribed = dbUser.subscriptions.length > 0
            
            // JWT plan info synced
          } else {
            // 降级处理：如果用户不存在，使用默认值
            token.planId = 'free'
            token.subscriptionPlan = 'free'
            token.isSubscribed = false
            // User not found, using default plan
          }
        } catch (error) {
          console.error('❌ JWT套餐信息获取失败:', error)
          // 降级处理：使用默认值
          token.planId = 'free'
          token.subscriptionPlan = 'free'
          token.isSubscribed = false
        }
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        // 添加套餐信息到session
        ;(session.user as any).planId = token.planId || 'free'
        ;(session.user as any).subscriptionPlan = token.subscriptionPlan || 'free'
        ;(session.user as any).planName = token.subscriptionPlan || 'free' // 兼容Navbar.tsx中的planName字段
        ;(session.user as any).isSubscribed = token.isSubscribed || false
        
        // Session plan info loaded
      }
      return session
    }
  },

  debug: false,
}
