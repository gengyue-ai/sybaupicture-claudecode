import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    // 🔥 **核心JWT回调** - 确保登录成功，同时进行数据库同步
    async jwt({ token, user }) {
      // 1. 基础token设置
      if (user) {
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }

      // 2. 数据库同步 - 容错处理，绝不抛出错误
      if (user?.email) {
        try {
          // 检查用户是否存在
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { 
              subscriptions: {
                where: { status: 'active' },
                include: { plan: true },
                orderBy: { createdAt: 'desc' },
                take: 1
              },
              _count: { select: { images: true } }
            }
          })

          // 如果用户不存在，创建新用户
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                createdAt: new Date(),
                updatedAt: new Date()
              },
              include: { 
                subscriptions: {
                  where: { status: 'active' },
                  include: { plan: true },
                  orderBy: { createdAt: 'desc' },
                  take: 1
                },
                _count: { select: { images: true } }
              }
            })
          } else {
            // 更新现有用户信息
            dbUser = await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name,
                image: user.image,
                updatedAt: new Date()
              },
              include: { 
                subscriptions: {
                  where: { status: 'active' },
                  include: { plan: true },
                  orderBy: { createdAt: 'desc' },
                  take: 1
                },
                _count: { select: { images: true } }
              }
            })
          }

          // 3. 将用户信息添加到token中
          const activeSubscription = dbUser.subscriptions[0]
          token.userId = dbUser.id
          token.subscriptionType = activeSubscription?.plan?.name || 'free'
          token.subscriptionStatus = activeSubscription?.status || 'inactive'
          token.usageCount = dbUser._count.images || 0

        } catch (error) {
          // 🛡️ 关键：即使数据库操作失败，也不能影响登录流程
          console.error('JWT回调中的数据库同步错误:', error)
          // 设置默认值，确保用户可以正常使用
          token.userId = null
          token.subscriptionType = 'free'
          token.subscriptionStatus = 'inactive'
          token.usageCount = 0
        }
      }

      return token
    },

    // 🔥 **Session回调** - 将token信息传递给session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        
        // 添加用户订阅信息
        ;(session.user as any).userId = token.userId
        ;(session.user as any).subscriptionType = token.subscriptionType
        ;(session.user as any).subscriptionStatus = token.subscriptionStatus
        ;(session.user as any).usageCount = token.usageCount
      }
      return session
    },

    // 🔥 **重定向回调** - 确保用户总是能跳转到首页
    async redirect({ url, baseUrl }) {
      // 如果是回调URL，直接跳转到首页
      if (url.includes('/auth/callback')) {
        return baseUrl
      }
      
      // 如果是相对URL，拼接baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // 如果是同域URL，允许跳转
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // 默认跳转到首页
      return baseUrl
    }
  },

  // 关闭调试模式
  debug: false,
}
