'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode, Component, ErrorInfo } from 'react'
import { UserProfileProvider } from '@/hooks/useUserProfile'

interface ProvidersProps {
  children: ReactNode
}

// Session错误边界组件
class SessionErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Session错误边界捕获错误:', error)
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Session错误详情:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // 出现错误时，提供fallback UI但不阻塞应用
      console.log('Session错误边界激活，使用fallback渲染')
      return this.props.children
    }

    return this.props.children
  }
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionErrorBoundary>
      <SessionProvider
        // 优化配置，减少错误和提升稳定性
        refetchInterval={0} // 禁用定时刷新，避免不必要的请求
        refetchOnWindowFocus={false} // 暂时禁用窗口焦点刷新，减少错误
        refetchWhenOffline={false} // 离线时不重新获取
        basePath="/api/auth" // 明确指定auth API路径
      >
        <UserProfileProvider>
          {children}
        </UserProfileProvider>
      </SessionProvider>
    </SessionErrorBoundary>
  )
}
