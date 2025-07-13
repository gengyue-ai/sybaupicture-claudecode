import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useAvatarCache() {
  const { data: session } = useSession()
  const [avatarVersion, setAvatarVersion] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 获取带版本号的头像URL
  const getAvatarUrl = (baseUrl: string | null | undefined): string | null => {
    if (!baseUrl) return null
    
    // 如果URL已经包含查询参数，添加&，否则添加?
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}v=${avatarVersion}`
  }

  // 刷新头像
  const refreshAvatar = async (): Promise<boolean> => {
    if (!session?.user?.email || isRefreshing) return false

    setIsRefreshing(true)
    
    try {
      // 步骤1: 从Google刷新用户信息并更新数据库
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        
        // 检查头像是否真的更新了
        if (result.success && result.user?.image !== session.user.image) {
          console.log('头像已更新，准备刷新会话:', {
            oldImage: session.user.image,
            newImage: result.user.image
          })
          
          // 步骤2: 更新版本号以破坏缓存
          setAvatarVersion(prev => prev + 1)
          
          // 步骤3: 强制刷新页面以更新session
          console.log('会话更新完成，刷新页面以显示新头像')
          setTimeout(() => {
            window.location.reload()
          }, 500)
          return true
        } else {
          console.log('头像未发生变化')
          return false
        }
      }
    } catch (error) {
      console.error('刷新头像失败:', error)
    } finally {
      setIsRefreshing(false)
    }
    
    return false
  }

  // 检查头像是否需要刷新（可以定期调用）
  const checkAvatarUpdate = async (): Promise<boolean> => {
    if (!session?.user?.email) return false

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'GET'
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.user?.image !== session.user.image) {
          console.log('检测到头像更新:', {
            sessionImage: session.user.image,
            dbImage: result.user.image
          })
          
          setAvatarVersion(prev => prev + 1)
          return true
        }
      }
    } catch (error) {
      console.error('检查头像更新失败:', error)
    }
    
    return false
  }

  // 定期检查头像更新（每5分钟）
  useEffect(() => {
    if (!session?.user?.email) return

    const interval = setInterval(checkAvatarUpdate, 5 * 60 * 1000) // 5分钟
    
    return () => clearInterval(interval)
  }, [session?.user?.email])

  return {
    getAvatarUrl,
    refreshAvatar,
    checkAvatarUpdate,
    isRefreshing,
    avatarVersion
  }
} 