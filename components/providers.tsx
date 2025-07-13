'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { UserProfileProvider } from '@/hooks/useUserProfile'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      // 🔑 优化session配置：确保登录后立即获取会话状态
      refetchInterval={0} // 禁用定时刷新，避免不必要的请求
      refetchOnWindowFocus={true} // 窗口焦点时刷新，确保状态同步
      refetchWhenOffline={false} // 离线时不重新获取
      basePath="/api/auth" // 明确指定auth API路径
      // 🔑 关键：确保初始会话状态立即检查
      session={undefined} // 让Provider自行获取最新状态
    >
      <UserProfileProvider>
        {children}
      </UserProfileProvider>
    </SessionProvider>
  )
}
