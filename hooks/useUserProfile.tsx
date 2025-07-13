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
      
      // 并行获取用户数据 - 优先获取最新用量信息
      const [usageResponse, subscriptionResponse, syncResponse] = await Promise.all([
        fetch('/api/user/usage?_t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/subscription?_t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/user/sync', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        })
      ])

      let profileData: UserProfileData | null = null

      // 🔑 优先使用用量API数据（最准确的实时数据）
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        console.log('✅ 用量API数据获取成功:', usageData)
        
        // 获取订阅信息作为补充
        let subscriptionInfo = null
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json()
          subscriptionInfo = subscriptionData.subscription
        }
        
        const isActive = subscriptionInfo?.status === 'active' || usageData.isSubscribed
        const planName = usageData.subscriptionPlan || subscriptionInfo?.plan?.name || 'free'
        
        profileData = {
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || null,
          isSubscribed: usageData.isSubscribed || false,
          subscriptionStatus: subscriptionInfo?.status || (usageData.isSubscribed ? 'active' : 'inactive'),
          subscriptionPlan: planName,
          usageCount: usageData.usageCount || 0,
          maxUsage: usageData.maxUsage || 5,
          stripeCustomerId: subscriptionInfo?.stripeCustomerId || null,
          planFeatures: {
            hasWatermark: !usageData.isSubscribed,
            maxImagesPerMonth: usageData.maxUsage || 5,
            maxResolution: planName === 'pro' ? '2048x2048' : planName === 'standard' ? '1536x1536' : '1024x1024',
            hasPriorityProcessing: usageData.isSubscribed && planName !== 'free'
          },
          lastSyncTime: Date.now(),
          isDataValid: true
        }
      }
      // 备用：使用订阅API数据
      else if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        console.log('✅ 订阅API数据获取成功:', subscriptionData)
        
        // 改进数据解析逻辑
        const subscription = subscriptionData.subscription
        const isActive = subscription?.status === 'active' || subscription?.isActive
        const planName = subscription?.plan?.name || subscriptionData.user?.plan?.name || 'free'
        
        profileData = {
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || null,
          isSubscribed: isActive || false,
          subscriptionStatus: subscription?.status || 'inactive',
          subscriptionPlan: planName,
          usageCount: subscriptionData.usage?.current || 0,
          maxUsage: subscriptionData.usage?.max || (planName === 'standard' ? 50 : planName === 'pro' ? 200 : 5),
          stripeCustomerId: subscription?.stripeCustomerId || subscriptionData.user?.stripeCustomerId || null,
          planFeatures: {
            hasWatermark: !isActive,
            maxImagesPerMonth: subscriptionData.usage?.max || (planName === 'standard' ? 50 : planName === 'pro' ? 200 : 5),
            maxResolution: planName === 'pro' ? '2048x2048' : planName === 'standard' ? '1536x1536' : '1024x1024',
            hasPriorityProcessing: isActive && planName !== 'free'
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

  // 用户登录后立即显示基本信息，然后异步同步详细数据
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !syncState.hasInitialized) {
      console.log('🔄 用户已登录，立即显示基本信息')
      
      // 立即设置基本用户信息 - 不等待任何同步
      const basicProfile: UserProfileData = {
        name: session.user.name || session.user.email?.split('@')[0] || '',
        email: session.user.email || '',
        image: session.user.image || null,
        isSubscribed: (session.user as any).subscriptionStatus === 'active',
        subscriptionStatus: (session.user as any).subscriptionStatus || 'inactive', 
        subscriptionPlan: (session.user as any).subscriptionType || 'free',
        usageCount: (session.user as any).usageCount || 0,
        maxUsage: 5, // 默认值，后续同步时更新
        stripeCustomerId: null,
        planFeatures: {
          hasWatermark: (session.user as any).subscriptionStatus !== 'active',
          maxImagesPerMonth: 5,
          maxResolution: '1024x1024',
          hasPriorityProcessing: false
        },
        lastSyncTime: Date.now(),
        isDataValid: false // 标记为需要后续同步
      }
      
      setProfile(basicProfile)
      setSyncState(prev => ({ ...prev, hasInitialized: true }))
      
      console.log('✅ 基本用户信息已显示:', {
        name: basicProfile.name,
        email: basicProfile.email,
        plan: basicProfile.subscriptionPlan
      })
      
      // 异步进行详细数据同步 - 不阻塞用户体验
      setTimeout(() => {
        backgroundSync().then(() => {
          console.log('✅ 详细数据同步完成')
        }).catch(error => {
          console.warn('⚠️ 详细数据同步失败，使用基本信息:', error)
        })
      }, 500) // 稍微延迟，让用户先看到基本信息
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