'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'

interface SyncStatus {
  isComplete: boolean
  error?: string
  userData?: any
}

export default function BackgroundUserSync() {
  const { data: session, status } = useSession()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isComplete: false })

  const syncUserInBackground = useCallback(async () => {
    if (!session?.user?.email) return
    
    try {
      console.log('🔄 后台开始同步用户数据...')
      
      // 调用用户同步API
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        })
      })

      if (response.ok) {
        const userData = await response.json()
        console.log('✅ 用户数据同步成功:', userData)
        
        setSyncStatus({
          isComplete: true,
          userData: userData
        })
      } else {
        const error = await response.text()
        console.warn('⚠️ 用户数据同步失败，但不影响使用:', error)
        
        setSyncStatus({
          isComplete: true,
          error: error
        })
      }
    } catch (error) {
      console.warn('⚠️ 后台同步出错，但不影响使用:', error)
      
      setSyncStatus({
        isComplete: true,
        error: String(error)
      })
    }
  }, [session?.user?.email, session?.user?.name, session?.user?.image])

  useEffect(() => {
    // 只有在用户已登录且还没有同步时才进行同步
    if (status === 'authenticated' && session?.user?.email && !syncStatus.isComplete) {
      syncUserInBackground()
    }
  }, [status, session?.user?.email, syncStatus.isComplete, syncUserInBackground])

  // 这个组件不渲染任何UI，只在后台工作
  return null
} 