import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

// 使用数据库session策略，更稳定可靠

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
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
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    // 🔥 **Session回调** - 数据库策略简化版
    async session({ session, user }) {
      try {
        if (user && session.user) {
          // 数据库策略下直接使用user对象
          session.user.id = user.id
          session.user.email = user.email || ''
          session.user.name = user.name || 'User'
          session.user.image = user.image || null
          
          console.log('✅ 数据库Session创建成功:', {
            id: user.id,
            email: user.email,
            name: user.name
          })
        }
        return session
      } catch (error) {
        console.error('Session回调错误:', error)
        // 返回基础session，确保不失败
        return session
      }
    },

    // 🔥 **重定向回调** - 极简逻辑，始终成功
    async redirect({ url, baseUrl }) {
      try {
        console.log('NextAuth redirect:', { url, baseUrl })
        
        // 安全的baseUrl处理
        const safeBaseUrl = baseUrl || 'https://sybaupicture.com'
        
        // 如果没有url或url无效，直接返回首页
        if (!url) {
          return safeBaseUrl
        }
        
        // 如果是登录/注册相关页面，始终重定向到首页
        if (url.includes('/auth/') || url.includes('signin') || url.includes('signout')) {
          return safeBaseUrl
        }
        
        // 如果是相对路径，组合为完整URL
        if (url.startsWith('/')) {
          return safeBaseUrl + url
        }
        
        // 如果是完整URL，检查是否同域
        try {
          const targetUrl = new URL(url)
          const baseUrlObj = new URL(safeBaseUrl)
          
          // 同域且不是认证页面，允许跳转
          if (targetUrl.origin === baseUrlObj.origin && !url.includes('/auth/')) {
            return url
          }
        } catch {
          // URL解析失败，安全返回首页
        }
        
        // 默认情况：返回首页
        return safeBaseUrl
        
      } catch (error) {
        console.error('Redirect回调错误:', error)
        // 任何错误都返回安全的首页
        return baseUrl || 'https://sybaupicture.com'
      }
    }
  },

  // 关闭调试模式
  debug: false,
}
