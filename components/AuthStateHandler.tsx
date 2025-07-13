'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * 处理认证状态变化的组件
 * 确保用户登录后立即重定向到首页并更新状态
 */
export function AuthStateHandler() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log('AuthStateHandler - 状态检查:', { 
      status, 
      hasSession: !!session, 
      pathname,
      userEmail: session?.user?.email 
    })

    // 🔑 关键：如果用户已登录但还在登录页面，立即重定向
    if (status === 'authenticated' && session?.user) {
      if (pathname === '/auth/signin' || pathname.includes('error=OAuthCallback')) {
        console.log('✅ 用户已登录，从登录页面重定向到首页')
        // 使用 replace 避免回退到登录页面
        router.replace('/')
        return
      }
      
      // 🔑 登录成功后，确保用户数据同步
      console.log('✅ 用户认证状态确认:', {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      })
    }

    // 🔑 如果在非登录页面但未认证，且不是初始加载状态
    if (status === 'unauthenticated' && pathname !== '/auth/signin' && !pathname.startsWith('/auth/')) {
      console.log('⚠️ 未认证用户访问受保护页面，但不强制重定向')
      // 不强制重定向，让用户选择是否登录
    }
  }, [status, session, pathname, router])

  // 这个组件不渲染任何UI
  return null
}