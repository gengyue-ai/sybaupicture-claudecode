'use client'

import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
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

  // 同步状态引用，避免循环依赖
  const isSyncingRef = useRef(false)
  const lastSyncTimeRef = useRef(0)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 后台静默同步数据 - 修复无限循环问题
  const backgroundSync = useCallback(async () => {
    if (!session?.user?.email || isSyncingRef.current) return
    
    // 防抖机制：限制同步频率，避免无限循环
    const now = Date.now()
    if (now - lastSyncTimeRef.current < 5000) { // 5秒内不重复同步
      console.log('🔄 同步请求被防抖机制阻止，距离上次同步', now - lastSyncTimeRef.current, 'ms')
      return
    }
    
    lastSyncTimeRef.current = now
    isSyncingRef.current = true
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      console.log('🔄 开始优化的用户数据同步')
      
      // 🎯 Ultra-Think修复：简化数据源，避免冲突
      // 优先使用最可靠的用量API，失败时才使用备用数据源
      let profileData: UserProfileData | null = null
      let primaryDataSource = 'none'

      // 主数据源：用量API（最准确的实时数据）
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时
        
        const usageResponse = await fetch('/api/user/usage?_t=' + Date.now(), { 
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (usageResponse.ok) {
          const usageData = await usageResponse.json()
          console.log('✅ 主数据源（用量API）获取成功:', usageData)
          primaryDataSource = 'usage'
          
          // 直接使用用量API的完整数据，避免数据混合导致的不一致
          const isSubscribed = Boolean(usageData.isSubscribed)
          const planName = usageData.subscriptionPlan || 'free'
        
          profileData = {
            name: session.user.name || '',
            email: session.user.email || '',
            image: session.user.image || null,
            isSubscribed: isSubscribed,
            subscriptionStatus: isSubscribed ? 'active' : 'inactive',
            subscriptionPlan: planName,
            usageCount: usageData.usageCount || 0,
            maxUsage: usageData.maxUsage || (planName === 'standard' ? 60 : planName === 'pro' ? 180 : 1),
            stripeCustomerId: usageData.stripeCustomerId || null,
            planFeatures: {
              hasWatermark: !isSubscribed,
              maxImagesPerMonth: usageData.maxUsage || (planName === 'standard' ? 60 : planName === 'pro' ? 180 : 1),
              maxResolution: planName === 'pro' ? '2048x2048' : planName === 'standard' ? '1536x1536' : '1024x1024',
              hasPriorityProcessing: isSubscribed && planName !== 'free'
            },
            lastSyncTime: Date.now(),
            isDataValid: true
          }
        }
      } catch (usageError) {
        console.warn('⚠️ 主数据源失败，尝试备用数据源:', usageError)
      }

      // 备用数据源1：订阅API
      if (!profileData) {
        try {
          const subscriptionResponse = await fetch('/api/subscription?_t=' + Date.now(), { 
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' }
          })
          
          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json()
            console.log('✅ 备用数据源（订阅API）获取成功:', subscriptionData)
            primaryDataSource = 'subscription'
        
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
              maxUsage: subscriptionData.usage?.max || (planName === 'standard' ? 60 : planName === 'pro' ? 180 : 1),
              stripeCustomerId: subscription?.stripeCustomerId || subscriptionData.user?.stripeCustomerId || null,
              planFeatures: {
                hasWatermark: !isActive,
                maxImagesPerMonth: subscriptionData.usage?.max || (planName === 'standard' ? 60 : planName === 'pro' ? 180 : 1),
                maxResolution: planName === 'pro' ? '2048x2048' : planName === 'standard' ? '1536x1536' : '1024x1024',
                hasPriorityProcessing: isActive && planName !== 'free'
              },
              lastSyncTime: Date.now(),
              isDataValid: true
            }
          }
        } catch (subscriptionError) {
          console.warn('⚠️ 备用数据源1失败，尝试最后的fallback:', subscriptionError)
        }
      }

      // 备用数据源2：同步API
      if (!profileData) {
        try {
          const syncResponse = await fetch('/api/user/sync?_t=' + Date.now(), { 
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' }
          })
          
          if (syncResponse.ok) {
            const syncData = await syncResponse.json()
            console.log('✅ 备用数据源2（同步API）获取成功:', syncData)
            primaryDataSource = 'sync'
        
            if (syncData.success && syncData.user) {
              profileData = {
                name: session.user.name || '',
                email: session.user.email || '',
                image: session.user.image || null,
                isSubscribed: syncData.user.isSubscribed || false,
                subscriptionStatus: syncData.user.subscriptionStatus || 'inactive',
                subscriptionPlan: syncData.user.subscriptionPlan || 'free',
                usageCount: syncData.user.usageCount || 0,
                maxUsage: syncData.user.maxUsage || 1,
                stripeCustomerId: syncData.user.stripeCustomerId || null,
                planFeatures: {
                  hasWatermark: !syncData.user.isSubscribed,
                  maxImagesPerMonth: syncData.user.maxUsage || 1,
                  maxResolution: '1024x1024',
                  hasPriorityProcessing: syncData.user.isSubscribed
                },
                lastSyncTime: Date.now(),
                isDataValid: true
              }
            }
          }
        } catch (syncError) {
          console.warn('⚠️ 所有数据源都失败，使用默认数据:', syncError)
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
      isSyncingRef.current = false
      setSyncState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSyncTime: Date.now()
      }))
    }
  }, [session?.user?.email]) // 🎯 修复：只依赖email，避免状态循环

  // 用户登录后立即显示基本信息，然后异步同步详细数据  
  useEffect(() => {
    // 清理之前的定时器
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }
    
    if (status === 'authenticated' && session?.user && !syncState.hasInitialized) {
      console.log('🔄 用户已登录，立即显示基本信息')
      
      // 立即设置基本用户信息 - 使用默认免费套餐信息，等待API同步
      const sessionPlan = 'free' // 默认为免费套餐，等待API确认
      const isSubscribed = false // 默认未订阅，等待API确认
      
      console.log('👤 新用户登录，设置默认信息等待API同步:', { userEmail: session.user.email })
      
      // 默认免费套餐配额
      const defaultLimits = { max: 5, resolution: '1024x1024' } // 提高默认配额
      
      const basicProfile: UserProfileData = {
        name: session.user.name || session.user.email?.split('@')[0] || '',
        email: session.user.email || '',
        image: session.user.image || null,
        isSubscribed: isSubscribed,
        subscriptionStatus: 'inactive', 
        subscriptionPlan: sessionPlan,
        usageCount: 0, // 需要同步获取
        maxUsage: defaultLimits.max,
        stripeCustomerId: null,
        planFeatures: {
          hasWatermark: false,
          maxImagesPerMonth: defaultLimits.max,
          maxResolution: defaultLimits.resolution,
          hasPriorityProcessing: false
        },
        lastSyncTime: Date.now(),
        isDataValid: true // 标记为有效，避免无限同步
      }
      
      setProfile(basicProfile)
      setSyncState(prev => ({ ...prev, hasInitialized: true }))
      
      console.log('✅ 基本用户信息已显示:', {
        name: basicProfile.name,
        email: basicProfile.email,
        plan: basicProfile.subscriptionPlan
      })
      
      // 异步进行详细数据同步 - 使用定时器引用避免重复
      syncTimeoutRef.current = setTimeout(() => {
        Promise.race([
          backgroundSync(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('同步超时')), 8000))
        ]).then(() => {
          console.log('✅ 详细数据同步完成')
        }).catch(error => {
          console.warn('⚠️ 详细数据同步失败，使用基本信息:', error)
          // 同步失败也不影响用户使用
        }).finally(() => {
          syncTimeoutRef.current = null
        })
      }, 500) // 适当延迟避免频繁调用
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
      console.log('⚠️ 用户数据未加载，允许生成（开发模式）')
      return { allowed: true, reason: '用户数据加载中...' }
    }

    // 如果数据无效，尝试刷新但不阻塞
    if (!profile.isDataValid) {
      console.log('🔄 数据无效，后台刷新中...')
      refreshData().catch(console.error) // 异步刷新，不等待
    }

    // 更宽松的用量检查 - 给用户更多机会
    const currentUsage = profile.usageCount || 0
    const maxUsage = profile.maxUsage || 5
    
    console.log('📊 用量检查:', { currentUsage, maxUsage, plan: profile.subscriptionPlan })

    // 免费用户给予更多宽容度
    if (profile.subscriptionPlan === 'free') {
      if (currentUsage >= maxUsage + 2) { // 免费用户额外给2次机会
        return {
          allowed: false,
          reason: `免费套餐每月限制 ${maxUsage} 张图片，已超出使用限制。升级到付费套餐享受更多生成次数！`
        }
      }
    } else {
      // 付费用户严格检查
      if (currentUsage >= maxUsage) {
        const planName = profile.subscriptionPlan.toUpperCase()
        return {
          allowed: false,
          reason: `${planName}套餐每月限制 ${maxUsage} 张图片，已用完。请等待下月重置或升级到更高套餐！`
        }
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
  const maxUsage = profile?.maxUsage || 1
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