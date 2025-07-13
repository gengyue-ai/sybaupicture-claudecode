import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// 🔧 恢复到最简化配置，确保OAuth正常工作

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],

  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: 'jwt',
  },

  callbacks: {
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
      }
      return session
    }
  },

  debug: true,
}
