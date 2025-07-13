import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// 极简配置，确保稳定性

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
    maxAge: 7 * 24 * 60 * 60, // 7 days - 减少到1周更稳定
  },

  callbacks: {
    // 极简化设计 - 只做最基本的重定向
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect:', { url, baseUrl })
      
      // 硬编码安全重定向
      if (url?.includes('/auth/') || !url) {
        return 'https://sybaupicture.com'
      }
      
      // 如果是相对路径，组合为完整URL
      if (url.startsWith('/')) {
        return 'https://sybaupicture.com' + url
      }
      
      // 如果是同域名，允许
      if (url.startsWith('https://sybaupicture.com')) {
        return url
      }
      
      // 默认返回首页
      return 'https://sybaupicture.com'
    }
  },

  // 开启调试模式来查看问题
  debug: true,
}
