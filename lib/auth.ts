import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { config } from './config'
import { prisma } from './prisma'

// 确保用户在数据库中存在（带重试机制）
async function ensureUserExists(userData: {
  email: string
  name: string
  image: string | null
}, maxRetries: number = 3) {
  if (!prisma) {
    console.warn('⚠️ 数据库不可用，跳过用户创建')
    return null
  }

  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 尝试创建/更新用户 (${attempt}/${maxRetries}):`, userData.email)
      
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

      console.log('✅ 用户记录同步成功:', {
        email: user.email,
        planId: user.planId,
        planName: user.plan?.name || 'free',
        hasActiveSubscription: user.subscriptions.length > 0,
        attempt: attempt
      })

      return user
    } catch (error: any) {
      lastError = error
      console.error(`❌ 用户创建/更新失败 (尝试 ${attempt}/${maxRetries}):`, {
        email: userData.email,
        error: error.message,
        code: error.code
      })
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // 指数退避，最大5秒
        console.log(`⏳ ${delayMs}ms 后重试...`)
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

// 🔧 使用环境特定配置，修复生产环境OAuth问题

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: config.auth.google.clientId,
      clientSecret: config.auth.google.clientSecret,
    })
  ],

  secret: process.env.NEXTAUTH_SECRET,
  
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
        // 确保用户在数据库中存在
        await ensureUserExists({
          email: user.email,
          name: user.name || '',
          image: user.image || null
        })
        
        console.log('✅ 用户登录并同步:', user.email)
        return true
      } catch (error) {
        console.error('❌ 用户创建失败:', error)
        // 即使数据库操作失败，也允许登录
        return true
      }
    },
    async redirect({ url, baseUrl }) {
      // 🔧 修复重定向逻辑：确保用户能正常返回首页
      console.log('🔄 Redirect callback:', { url, baseUrl })
      
      // 如果是相对URL，直接拼接baseUrl
      if (url.startsWith('/')) {
        const redirectUrl = baseUrl + url
        console.log('✅ Relative URL redirect:', redirectUrl)
        return redirectUrl
      }
      
      // 如果是完整URL且是同域名，允许重定向
      if (url.startsWith(baseUrl)) {
        console.log('✅ Same domain redirect:', url)
        return url
      }
      
      // 默认重定向到首页
      console.log('🏠 Default redirect to home:', baseUrl)
      return baseUrl
    },

    async jwt({ token, user, account }) {
      // 初次登录时获取用户完整信息
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
            
            console.log('✅ JWT套餐信息同步:', {
              email: user.email,
              planId: dbUser.planId,
              subscriptionPlan: token.subscriptionPlan,
              isSubscribed: token.isSubscribed
            })
          } else {
            // 降级处理：如果用户不存在，使用默认值
            token.planId = 'free'
            token.subscriptionPlan = 'free'
            token.isSubscribed = false
            console.warn('⚠️ 用户不存在，使用默认套餐信息:', user.email)
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
        ;(session.user as any).isSubscribed = token.isSubscribed || false
        
        console.log('✅ Session套餐信息:', {
          email: session.user.email,
          planId: (session.user as any).planId,
          subscriptionPlan: (session.user as any).subscriptionPlan,
          isSubscribed: (session.user as any).isSubscribed
        })
      }
      return session
    }
  },

  debug: true,
}
