import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function useUserSync() {
  const { data: session, status } = useSession()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncCompleted, setSyncCompleted] = useState(false)
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false)

  useEffect(() => {
    // 🚨 修复：避免无限循环，不再调用session.update
    if (status === 'authenticated' && 
        session?.user?.email && 
        (session.user as any)?.needsDataSync && 
        !hasAttemptedSync && 
        !isSyncing) {
      
      console.log('🔄 useUserSync: 开始后台同步用户数据')
      setIsSyncing(true)
      setHasAttemptedSync(true)

      const syncUserData = async () => {
        try {
          const response = await fetch('/api/user/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            console.log('✅ useUserSync: 用户数据同步成功')
            setSyncCompleted(true)
          } else {
            console.log('❌ useUserSync: 用户数据同步失败')
          }
        } catch (error) {
          console.error('❌ useUserSync: 同步用户数据时出错:', error)
        } finally {
          setIsSyncing(false)
        }
      }

      // 延迟执行避免与其他同步逻辑冲突
      const timer = setTimeout(syncUserData, 2000)
      return () => clearTimeout(timer)
    }

    // 重置状态当用户登出时
    if (status === 'unauthenticated') {
      setIsSyncing(false)
      setSyncCompleted(false)
      setHasAttemptedSync(false)
    }
  }, [status, session?.user?.email, hasAttemptedSync, isSyncing])

  return {
    isSyncing,
    syncCompleted,
    needsSync: (session?.user as any)?.needsDataSync || false
  }
} 