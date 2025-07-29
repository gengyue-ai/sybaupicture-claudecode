'use client'

import { useState } from 'react'
import { User } from 'lucide-react'

interface UserAvatarProps {
  image?: string | null
  name?: string | null
  email?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
}

// 获取用户首字母
const getUserInitials = (name: string | null | undefined, email: string | null | undefined): string => {
  if (name && name.trim()) {
    // 处理中文和英文名字
    const nameParts = name.trim().split(' ')
    if (nameParts.length === 1) {
      // 可能是中文名或单个英文名
      const singleName = nameParts[0]
      if (singleName.length > 1) {
        // 如果是多字符，取前两个字符（适合中文名）  
        return singleName.slice(0, 2).toUpperCase()
      } else {
        return singleName.toUpperCase()
      }
    } else {
      // 多个单词，取每个单词的首字母
      return nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
  }
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  return 'U'
}

// 检测是否为Google用户头像
const isGoogleAvatar = (imageUrl: string | null | undefined): boolean => {
  return Boolean(imageUrl && imageUrl.includes('googleusercontent.com'))
}

export function UserAvatar({ 
  image, 
  name, 
  email, 
  size = 'md', 
  className = '',
  showBorder = true 
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)

  // 尺寸配置
  const sizeConfig = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm', 
    lg: 'h-12 w-12 text-base',
    xl: 'h-24 w-24 text-2xl'
  }

  const borderClass = showBorder ? 'border-2 border-gray-200' : ''
  const avatarClass = `${sizeConfig[size]} rounded-full overflow-hidden ${borderClass} ${className}`

  // 如果有图片且不是错误状态，显示图片
  if (image && !imageError) {
    return (
      <div className={avatarClass}>
        <img
          src={image}
          alt={name || email || 'User Avatar'}
          className="h-full w-full object-cover"
          onError={() => {
            console.log('头像加载失败:', image)
            setImageError(true)
          }}
          onLoad={() => {
            console.log('头像加载成功:', image)
          }}
        />
      </div>
    )
  }

  // Google用户头像加载失败或邮箱用户默认头像
  const isGoogle = isGoogleAvatar(image)
  const initials = getUserInitials(name, email)

  return (
    <div className={avatarClass}>
      {isGoogle ? (
        // Google用户头像加载失败时，使用与原来相同的深色头像保持一致性
        <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
          {initials}
        </div>
      ) : (
        // 邮箱用户使用浅色系头像，匹配网站风格
        <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-medium border border-blue-200">
          {initials || <User className="h-1/2 w-1/2 text-blue-500" />}
        </div>
      )}
    </div>
  )
}