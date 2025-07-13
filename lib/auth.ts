import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// 完整配置，确保会话正确创建和存储

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID_PROD!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_PROD!,
    })
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    // 🔑 JWT回调 - 确保token正确创建和存储
    async jwt({ token, user, account }) {
      console.log('NextAuth JWT callback:', { 
        hasToken: !!token, 
        hasUser: !!user, 
        hasAccount: !!account,
        tokenSub: token.sub,
        userEmail: user?.email 
      })
      
      // 首次登录时，将用户信息存储到token中
      if (user && account) {
        console.log('首次登录，存储用户信息到JWT token')
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.provider = account.provider
      }
      
      return token
    },

    // 🔑 Session回调 - 确保会话数据正确传递给客户端
    async session({ session, token }) {
      console.log('NextAuth Session callback:', { 
        hasSession: !!session, 
        hasToken: !!token,
        tokenSub: token.sub,
        sessionUserEmail: session.user?.email 
      })
      
      if (token && session.user) {
        // 扩展session.user对象，添加id属性
        (session.user as any).id = token.sub
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      
      console.log('Session数据准备完成:', {
        userId: (session.user as any)?.id,
        userEmail: session.user?.email,
        userName: session.user?.name,
        hasImage: !!session.user?.image
      })
      
      return session
    },

    // 🔑 重定向回调 - 简化但确保正确
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl })
      
      // 如果是认证相关页面或空URL，重定向到首页
      if (!url || url.includes('/auth/') || url.includes('error=')) {
        console.log('重定向到首页（认证页面或错误）')
        return 'https://sybaupicture.com'
      }
      
      // 如果是相对路径，组合为完整URL
      if (url.startsWith('/')) {
        const fullUrl = 'https://sybaupicture.com' + url
        console.log('相对路径重定向:', fullUrl)
        return fullUrl
      }
      
      // 如果是同域名，允许
      if (url.startsWith('https://sybaupicture.com')) {
        console.log('同域名重定向:', url)
        return url
      }
      
      // 默认返回首页
      console.log('默认重定向到首页')
      return 'https://sybaupicture.com'
    }
  },

  // 开启调试模式
  debug: true,
}
