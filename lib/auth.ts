import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { config } from './config'
import { prisma } from './prisma'

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
      if (!user.email) return false
      
      try {
        // 确保用户在数据库中存在
        if (prisma) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { plan: true }
          })
          
          if (!existingUser) {
            console.log('🆕 创建新用户:', user.email)
            
            // 为所有新用户设置免费套餐
            const freePlan = await prisma.plan.upsert({
              where: { name: 'free' },
              create: {
                name: 'free',
                displayName: 'Free',
                description: 'Free plan with 1 image per month',
                price: 0,
                yearlyPrice: 0,
                maxImagesPerMonth: 1,
                maxResolution: '1024x1024',
                hasWatermark: false,
                hasPriorityProcessing: false,
                hasBatchProcessing: false,
                hasAdvancedFeatures: false,
                availableStyles: JSON.stringify(['classic'])
              },
              update: {}
            })
            
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                image: user.image || null,
                planId: freePlan.id
              }
            })
            
            // 为所有新用户初始化当前月份用量记录
            const currentMonth = new Date().getMonth() + 1
            const currentYear = new Date().getFullYear()
            await prisma.userUsage.create({
              data: {
                userId: newUser.id,
                month: currentMonth,
                year: currentYear,
                imagesGenerated: 0
              }
            })
            console.log('✅ 为新用户初始化用量记录')
            
          } else {
            console.log('✅ 用户已存在:', user.email)
            // 更新用户信息
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                updatedAt: new Date()
              }
            })
          }
        }
        return true
      } catch (error) {
        console.error('❌ signIn回调错误:', error)
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

    async jwt({ token, user, account, trigger }) {
      if (user && account) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        // 新用户登录时，强制刷新套餐信息
        token.lastUpdate = 0 // 强制下次检查时更新
        
      }
      
      // 立即刷新新用户套餐信息，或定期刷新现有用户信息
      const shouldUpdateImmediately = (user && account) || trigger === 'update'
      const shouldUpdatePeriodically = token.email && (!token.subscriptionPlan || Date.now() - (token.lastUpdate as number || 0) > 30000)
      
      if (shouldUpdateImmediately || shouldUpdatePeriodically) {
        try {
          if (prisma && token.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email as string },
              include: {
                plan: true,
                subscriptions: {
                  where: { status: 'active' },
                  include: { plan: true },
                  take: 1
                }
              }
            })
            
            if (dbUser) {
              const planName = dbUser.subscriptions?.[0]?.plan?.name || dbUser.plan?.name || 'free'
              token.subscriptionPlan = planName
              token.isSubscribed = dbUser.subscriptions?.length > 0 || planName !== 'free'
              token.lastUpdate = Date.now()
              
              console.log(`🔄 JWT套餐信息更新: ${token.email} -> ${planName} (isSubscribed: ${token.isSubscribed})`)
            } else {
              // 用户在数据库中不存在，设置为免费套餐
              token.subscriptionPlan = 'free'
              token.isSubscribed = false
              token.lastUpdate = Date.now()
              console.log(`⚠️ 用户不在数据库中: ${token.email} -> 设置为免费套餐`)
            }
          }
        } catch (error) {
          console.error('❌ JWT更新套餐信息失败:', error)
          // 错误时设置为免费套餐
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
        ;(session.user as any).subscriptionPlan = token.subscriptionPlan || 'free'
        ;(session.user as any).isSubscribed = token.isSubscribed || false
      }
      return session
    }
  },

  debug: true,
}
