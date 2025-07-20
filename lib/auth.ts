import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { config } from './config'

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

  callbacks: {
    async signIn({ user, account, profile }) {
      // 🔧 简化signIn回调，只验证基本信息，不进行数据库操作
      if (!user.email) return false
      console.log('✅ 用户登录:', user.email)
      return true
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
      // 🔧 简化JWT回调，避免复杂数据库查询
      if (user && account) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
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
        ;(session.user as any).subscriptionPlan = token.subscriptionPlan || 'free'
        ;(session.user as any).isSubscribed = token.isSubscribed || false
      }
      return session
    }
  },

  debug: true,
}
