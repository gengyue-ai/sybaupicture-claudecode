import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserData {
  isSubscribed: boolean
  subscriptionStatus: string
  subscriptionPlan: string
  maxUsage: number
  usageCount: number
  stripeCustomerId: string | null
}

export function useUserData() {
  const { data: session, status, update } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSyncedOnce, setHasSyncedOnce] = useState(false)
  
  // 🚀 用户登录后静默同步数据（不显示UI状态）
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && !hasSyncedOnce) {
      console.log('🔄 用户已登录，开始后台静默同步')
      
      // 设置默认权限，确保用户立即可以使用
      const defaultUserData: UserData = {
        isSubscribed: false,
        subscriptionStatus: 'inactive',
        subscriptionPlan: 'free',
        maxUsage: 5,
        usageCount: 0,
        stripeCustomerId: null,
      }
      setUserData(defaultUserData)
      
      // 延迟1秒后开始后台同步，让用户先正常使用
      setTimeout(() => {
        silentSyncUserData()
      }, 1000)
      
      setHasSyncedOnce(true)
    }
  }, [status, session?.user?.email, hasSyncedOnce])

  // 🤫 静默同步用户数据（不设置loading状态）
  const silentSyncUserData = useCallback(async () => {
    if (!session?.user?.email) return

    try {
      console.log('🔄 静默同步用户数据:', session.user.email)
      
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })

      if (!response.ok) {
        console.warn('⚠️ 静默同步失败，使用默认权限')
        return
      }

      const result = await response.json()
      
      if (result.success && result.user) {
        console.log('✅ 静默同步成功:', {
          plan: result.user.subscriptionPlan,
          isSubscribed: result.user.isSubscribed,
          usage: `${result.user.usageCount}/${result.user.maxUsage}`
        })
        
        const newUserData: UserData = {
          isSubscribed: result.user.isSubscribed || false,
          subscriptionStatus: result.user.subscriptionStatus || 'inactive',
          subscriptionPlan: result.user.subscriptionPlan || 'free',
          maxUsage: result.user.maxUsage || 5,
          usageCount: result.user.usageCount || 0,
          stripeCustomerId: result.user.stripeCustomerId || null,
        }
        
        setUserData(newUserData)
        setError(null)
        
        // 如果头像有更新，静默刷新session
        if (result.user.image && result.user.image !== session.user.image) {
          console.log('🖼️ 头像已更新，静默刷新会话')
          update()
        }
      } else {
        console.warn('⚠️ 静默同步返回失败结果，保持默认权限')
      }
      
    } catch (error) {
      console.warn('⚠️ 静默同步异常，保持默认权限:', error)
      // 静默失败，不影响用户体验
    }
  }, [session?.user?.email, update])

  // 🎯 同步数据库数据（现在主要用于手动重试）
  const syncUserData = useCallback(async () => {
    if (!session?.user?.email || loading) return userData

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 手动同步用户数据:', session.user.email)
      
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('同步用户数据失败')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || '同步失败')
      }

      console.log('✅ 手动同步成功:', data)

      const newUserData: UserData = {
        isSubscribed: data.user?.isSubscribed || false,
        subscriptionStatus: data.user?.subscriptionStatus || 'inactive',
        subscriptionPlan: data.user?.subscriptionPlan || 'free',
        maxUsage: data.user?.maxUsage || 5,
        usageCount: data.user?.usageCount || 0,
        stripeCustomerId: data.user?.stripeCustomerId || null,
      }

      setUserData(newUserData)
      return newUserData
    } catch (err) {
      console.error('❌ 手动同步失败:', err)
      setError(err instanceof Error ? err.message : '同步失败')
      return null
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email, loading])

  // 🎯 检查用量权限 - 在用户操作时调用
  const checkUsagePermission = useCallback(async (): Promise<{
    allowed: boolean
    reason?: string
    needsReauth?: boolean
  }> => {
    // 如果没有用户数据，尝试同步一次
    let currentData = userData
    if (!currentData) {
      console.log('🔄 检查权限时发现无用户数据，尝试同步')
      currentData = await syncUserData()
    }
    
    if (!currentData) {
      return {
        allowed: false,
        reason: '无法获取用户数据，请重新登录',
        needsReauth: true
      }
    }

    console.log('🔍 检查用量权限:', {
      current: currentData.usageCount,
      max: currentData.maxUsage,
      plan: currentData.subscriptionPlan,
      isSubscribed: currentData.isSubscribed
    })

    // 付费用户无限制
    if (currentData.isSubscribed && currentData.subscriptionStatus === 'active') {
      return { allowed: true }
    }

    // 免费用户检查用量
    if (currentData.usageCount >= currentData.maxUsage) {
      return {
        allowed: false,
        reason: `免费用户每月限制 ${currentData.maxUsage} 张图片，已用完。升级到付费套餐享受无限制生成！`
      }
    }

    return { allowed: true }
  }, [userData, syncUserData])

  // 🔥 修复双重计数：移除用量更新功能，只保留数据刷新
  // 使用量更新应该只在后端图片生成流程中进行，前端只负责刷新显示最新数据
  const updateUsageCount = useCallback(async () => {
    // 已废弃：不再直接更新使用量，避免双重计数
    // 图片生成成功后应该调用syncUserData()来同步最新使用量
    console.warn('⚠️ updateUsageCount已废弃，请使用syncUserData()来同步最新使用量')
    await syncUserData()
  }, [syncUserData])

  // 🎯 获取当前有效的用户数据
  const getEffectiveUserData = useCallback(() => {
    return {
      isSubscribed: userData?.isSubscribed || false,
      subscriptionPlan: userData?.subscriptionPlan || 'free',
      maxUsage: userData?.maxUsage || 5,
      usageCount: userData?.usageCount || 0,
      subscriptionStatus: userData?.subscriptionStatus || 'inactive',
    }
  }, [userData])

  const effectiveData = getEffectiveUserData()

  return {
    userData,
    loading,
    error,
    syncUserData,
    checkUsagePermission,
    updateUsageCount,
    // 便捷的状态检查
    isSubscribed: effectiveData.isSubscribed,
    usageCount: effectiveData.usageCount,
    maxUsage: effectiveData.maxUsage,
    subscriptionPlan: effectiveData.subscriptionPlan,
    subscriptionStatus: effectiveData.subscriptionStatus,
  }
} 