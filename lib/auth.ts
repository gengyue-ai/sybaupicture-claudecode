import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// 注意：数据库用户同步现在在前端useUserProfile中处理，确保登录流程不被阻塞

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
    // 🔥 **核心JWT回调** - 极简设计，绝不失败
    async jwt({ token, user }) {
      try {
        // 1. 基础token设置 - 只设置必需的字段
        if (user) {
          token.email = user.email
          token.name = user.name
          token.image = user.image
          token.loginTime = Date.now()
        }

        // 2. 设置默认订阅信息 - 简单的默认值
        if (!token.subscriptionType) {
          token.subscriptionType = 'free'
          token.subscriptionStatus = 'inactive'
          token.usageCount = 0
        }

        // 3. 移除所有数据库操作 - 让前端处理同步
        // 数据库同步将在useUserProfile中处理

        return token
      } catch (error) {
        console.error('JWT回调错误:', error)
        // 即使出错也要返回基础token，确保登录不失败
        return {
          ...token,
          email: user?.email || token.email,
          name: user?.name || token.name,
          image: user?.image || token.image,
          subscriptionType: 'free',
          subscriptionStatus: 'inactive',
          usageCount: 0
        }
      }
    },

    // 🔥 **Session回调** - 安全地传递token信息到session
    async session({ session, token }) {
      try {
        if (token && session.user) {
          // 基本用户信息 - 确保这些总是存在
          session.user.email = token.email as string || ''
          session.user.name = token.name as string || session.user.email || 'User'
          session.user.image = token.image as string || null
          
          // 添加扩展用户信息 - 使用安全的默认值
          const extendedUser = session.user as typeof session.user & {
            subscriptionType?: string
            subscriptionStatus?: string
            usageCount?: number
            loginTime?: number
          }
          extendedUser.subscriptionType = token.subscriptionType as string || 'free'
          extendedUser.subscriptionStatus = token.subscriptionStatus as string || 'inactive'
          extendedUser.usageCount = token.usageCount as number || 0
          extendedUser.loginTime = token.loginTime as number || Date.now()
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
