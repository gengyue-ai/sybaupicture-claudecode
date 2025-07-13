'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'

// 用户数据类型定义
export interface UserProfileData {
  name: string
  email: string
  image: string | null
  isSubscribed: boolean
  subscriptionStatus: string
  subscriptionPlan: string
  usageCount: number
  maxUsage: number
  stripeCustomerId: string | null
  planFeatures: {
    hasWatermark: boolean
    maxImagesPerMonth: number
    maxResolution: string
    hasPriorityProcessing: boolean
  }
  lastSyncTime: number
  isDataValid: boolean
}

// 同步状态类型
interface SyncState {
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  lastSyncTime: number
  hasInitialized: boolean
}

// Hook返回类型
interface UseUserProfileReturn {
  profile: UserProfileData | null
  syncState: SyncState
  refreshData: () => Promise<void>
  checkUsagePermission: () => Promise<{ allowed: boolean; reason?: string }>
  updateUsageCount: () => Promise<void>
  isSubscribed: boolean
  usageCount: number
  maxUsage: number
  remainingUsage: number
  subscriptionPlan: string
}

// 默认用户数据
const DEFAULT_PROFILE: UserProfileData = {
  name: '',
  email: '',
  image: null,
  isSubscribed: false,
  subscriptionStatus: 'inactive',
  subscriptionPlan: 'free',
  usageCount: 0,
  maxUsage: 5,
  stripeCustomerId: null,
  planFeatures: {
    hasWatermark: false,
    maxImagesPerMonth: 5,
    maxResolution: '1024x1024',
    hasPriorityProcessing: false
  },
  lastSyncTime: 0,
  isDataValid: false
}

// 创建Context
const UserProfileContext = createContext<UseUserProfileReturn | null>(null)

// Provider组件
export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    isSyncing: false,
    error: null,
    lastSyncTime: 0,
    hasInitialized: false
  })

  // 后台静默同步数据
  const backgroundSync = useCallback(async () => {
    if (!session?.user?.email || syncState.isSyncing) return

    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      console.log('🔄 开始后台同步用户数据')
      
      // 并行获取用户数据
      const [subscriptionResponse, syncResponse] = await Promise.all([
        fetch('/api/subscription?_t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/user/sync', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        })
      ])

      let profileData: UserProfileData | null = null

      // 优先使用订阅API数据
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        console.log('✅ 订阅API数据获取成功')
        
        profileData = {
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || null,
          isSubscribed: subscriptionData.subscription?.isActive || false,
          subscriptionStatus: subscriptionData.subscription?.plan?.name || 'free',
          subscriptionPlan: subscriptionData.subscription?.plan?.name || 'free',
          usageCount: subscriptionData.usage?.current || 0,
          maxUsage: subscriptionData.usage?.max || 5,
          stripeCustomerId: subscriptionData.subscription?.stripeSubscriptionId || null,
          planFeatures: {
            hasWatermark: subscriptionData.subscription?.plan?.hasWatermark || false,
            maxImagesPerMonth: subscriptionData.usage?.max || 5,
            maxResolution: subscriptionData.subscription?.plan?.maxResolution || '1024x1024',
            hasPriorityProcessing: subscriptionData.subscription?.plan?.hasPriorityProcessing || false
          },
          lastSyncTime: Date.now(),
          isDataValid: true
        }
      }
      // 备用：使用同步API数据
      else if (syncResponse.ok) {
        const syncData = await syncResponse.json()
        console.log('✅ 同步API数据获取成功')
        
        if (syncData.success && syncData.user) {
          profileData = {
            name: session.user.name || '',
            email: session.user.email || '',
            image: session.user.image || null,
            isSubscribed: syncData.user.isSubscribed || false,
            subscriptionStatus: syncData.user.subscriptionStatus || 'inactive',
            subscriptionPlan: syncData.user.subscriptionPlan || 'free',
            usageCount: syncData.user.usageCount || 0,
            maxUsage: syncData.user.maxUsage || 5,
            stripeCustomerId: syncData.user.stripeCustomerId || null,
            planFeatures: {
              hasWatermark: !syncData.user.isSubscribed,
              maxImagesPerMonth: syncData.user.maxUsage || 5,
              maxResolution: '1024x1024',
              hasPriorityProcessing: syncData.user.isSubscribed
            },
            lastSyncTime: Date.now(),
            isDataValid: true
          }
        }
      }

      if (profileData) {
        setProfile(profileData)
        console.log('✅ 后台同步成功:', {
          plan: profileData.subscriptionPlan,
          isSubscribed: profileData.isSubscribed,
          usage: profileData.usageCount + '/' + profileData.maxUsage
        })
      } else {
        console.warn('⚠️ 后台同步失败，保持当前数据')
      }

    } catch (error) {
      console.warn('⚠️ 后台同步异常，不影响用户使用:', error)
      setSyncState(prev => ({ ...prev, error: String(error) }))
    } finally {
      setSyncState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSyncTime: Date.now()
      }))
    }
  }, [session?.user?.email, syncState.isSyncing])

  // 用户登录后立即初始化默认数据，然后开始后台同步
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !syncState.hasInitialized) {
      console.log('🔄 用户已登录，初始化默认数据并开始后台同步')
      
      // 立即设置默认数据，让用户可以马上使用
      const initialProfile: UserProfileData = {
        ...DEFAULT_PROFILE,
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || null,
        isDataValid: false
      }
      
      setProfile(initialProfile)
      setSyncState(prev => ({ ...prev, hasInitialized: true }))
      
      // 立即开始后台同步
      setTimeout(() => {
        backgroundSync()
      }, 100)
    }
    
    // 用户登出时清空数据
    if (status === 'unauthenticated') {
      setProfile(null)
      setSyncState({
        isLoading: false,
        isSyncing: false,
        error: null,
        lastSyncTime: 0,
        hasInitialized: false
      })
    }
  }, [status, session?.user?.email, syncState.hasInitialized, backgroundSync])

  // 手动刷新数据
  const refreshData = useCallback(async () => {
    if (!session?.user?.email) return

    setSyncState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      await backgroundSync()
    } finally {
      setSyncState(prev => ({ ...prev, isLoading: false }))
    }
  }, [backgroundSync, session?.user?.email])

  // 检查用量权限
  const checkUsagePermission = useCallback(async (): Promise<{ allowed: boolean; reason?: string }> => {
    if (!profile) {
      return { allowed: false, reason: '用户数据未加载，请稍后重试' }
    }

    // 如果数据无效，尝试刷新
    if (!profile.isDataValid) {
      console.log('🔄 数据无效，尝试刷新')
      await refreshData()
    }

    const currentProfile = profile

    console.log('🔍 检查用量权限:', {
      current: currentProfile.usageCount,
      max: currentProfile.maxUsage,
      plan: currentProfile.subscriptionPlan,
      isSubscribed: currentProfile.isSubscribed
    })

    // 付费用户通常有更高的限制
    if (currentProfile.isSubscribed && currentProfile.subscriptionStatus === 'active') {
      return { allowed: true }
    }

    // 免费用户检查用量
    if (currentProfile.usageCount >= currentProfile.maxUsage) {
      return {
        allowed: false,
        reason: '免费用户每月限制 ' + currentProfile.maxUsage + ' 张图片，已用完。升级到付费套餐享受更多生成次数！'
      }
    }

    return { allowed: true }
  }, [profile, refreshData])

  // 更新用量计数
  const updateUsageCount = useCallback(async () => {
    if (!profile) return

    try {
      const response = await fetch('/api/user/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        
        // 更新本地缓存的用量
        setProfile(prev => prev ? {
          ...prev,
          usageCount: data.usageCount || prev.usageCount + 1,
          lastSyncTime: Date.now()
        } : null)
        
        console.log('✅ 用量更新成功:', data.usageCount)
      }
    } catch (error) {
      console.error('❌ 更新用量失败:', error)
    }
  }, [profile])

  // 便捷访问属性
  const isSubscribed = profile?.isSubscribed || false
  const usageCount = profile?.usageCount || 0
  const maxUsage = profile?.maxUsage || 5
  const remainingUsage = Math.max(0, maxUsage - usageCount)
  const subscriptionPlan = profile?.subscriptionPlan || 'free'

  const value: UseUserProfileReturn = {
    profile,
    syncState,
    refreshData,
    checkUsagePermission,
    updateUsageCount,
    isSubscribed,
    usageCount,
    maxUsage,
    remainingUsage,
    subscriptionPlan
  }

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
}

// Hook
export function useUserProfile(): UseUserProfileReturn {
  const context = useContext(UserProfileContext)
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
} 