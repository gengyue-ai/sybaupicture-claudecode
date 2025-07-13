import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 🔧 异步数据库同步函数 - 不阻塞登录流程
async function syncUserToDatabase(email: string, name?: string | null, image?: string | null) {
  try {
    console.log('🔄 开始后台数据库用户同步:', email)
    
    // 查找或创建用户
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: name || email.split('@')[0],
        image,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      update: {
        name: name || undefined,
        image: image || undefined,
        updatedAt: new Date()
      }
    })
    
    console.log('✅ 后台数据库用户同步完成:', user.id)
    return user
  } catch (error) {
    console.error('❌ 后台数据库用户同步失败:', error)
    throw error
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NODE_ENV === 'production' 
        ? process.env.GOOGLE_CLIENT_ID_PROD! 
        : (process.env.GOOGLE_CLIENT_ID_DEV! || process.env.GOOGLE_CLIENT_ID!),
      clientSecret: process.env.NODE_ENV === 'production' 
        ? process.env.GOOGLE_CLIENT_SECRET_PROD! 
        : (process.env.GOOGLE_CLIENT_SECRET_DEV! || process.env.GOOGLE_CLIENT_SECRET!),
    })
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    // 🔥 **核心JWT回调** - 只做基本token设置，不阻塞登录
    async jwt({ token, user }) {
      // 1. 基础token设置 - 这是必需的
      if (user) {
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.loginTime = Date.now() // 记录登录时间
      }

      // 2. 设置默认订阅信息 - 避免undefined
      if (!token.subscriptionType) {
        token.subscriptionType = 'free'
        token.subscriptionStatus = 'inactive'
        token.usageCount = 0
      }

      // 3. 异步触发数据库同步 - 不等待结果，不阻塞登录
      if (user?.email && !token.dbSyncTriggered) {
        token.dbSyncTriggered = true
        // 异步执行，不等待结果
        setImmediate(async () => {
          try {
            await syncUserToDatabase(user.email!, user.name, user.image)
          } catch (error) {
            console.error('后台数据库同步失败:', error)
          }
        })
      }

      return token
    },

    // 🔥 **Session回调** - 将token信息传递给session
    async session({ session, token }) {
      if (token && session.user) {
        // 基本用户信息 - 确保这些总是存在
        session.user.email = token.email as string
        session.user.name = token.name as string || token.email as string
        session.user.image = token.image as string
        
        // 添加扩展用户信息
        ;(session.user as any).subscriptionType = token.subscriptionType || 'free'
        ;(session.user as any).subscriptionStatus = token.subscriptionStatus || 'inactive'
        ;(session.user as any).usageCount = token.usageCount || 0
        ;(session.user as any).loginTime = token.loginTime
      }
      return session
    },

    // 🔥 **重定向回调** - 简化逻辑，避免循环
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect:', { url, baseUrl })
      
      // 如果已经在首页，直接返回
      if (url === baseUrl || url === baseUrl + '/') {
        return baseUrl
      }
      
      // 如果是登录页面，重定向到首页
      if (url.includes('/auth/signin')) {
        return baseUrl
      }
      
      // 如果是相对路径且在同一域名下，允许跳转
      if (url.startsWith('/') && !url.includes('/auth/signin')) {
        return `${baseUrl}${url}`
      }
      
      // 如果是完整URL且同域，允许跳转
      try {
        const targetUrl = new URL(url)
        const baseUrlObj = new URL(baseUrl)
        if (targetUrl.origin === baseUrlObj.origin && !url.includes('/auth/signin')) {
          return url
        }
      } catch (e) {
        // URL解析失败，默认跳转首页
      }
      
      // 默认跳转到首页
      return baseUrl
    }
  },

  // 关闭调试模式
  debug: false,
}
