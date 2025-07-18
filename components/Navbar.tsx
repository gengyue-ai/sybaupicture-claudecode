'use client'

import { useState } from 'react'
import { useSession, signOut, signIn } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  UserCircle, 
  LogOut, 
  User, 
  History, 
  CreditCard, 
  Settings
} from 'lucide-react'

// 文本配置
const texts = {
  en: {
    home: 'Home',
    gallery: 'Gallery',
    pricing: 'Pricing',
    help: 'Help',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    signingOut: 'Signing Out...',
    profile: 'Profile',
    history: 'History',
    billing: 'Billing',
    support: 'Support',
    syncing: 'Syncing...'
  },
  zh: {
    home: '首页',
    gallery: '画廊',
    pricing: '定价',
    help: '帮助',
    signIn: '登录',
    signOut: '退出',
    signingOut: '退出中...',
    profile: '个人资料',
    history: '历史记录',
    billing: '账单',
    support: '支持',
    syncing: '同步中...'
  }
}

const getUserInitials = (name: string | null | undefined, email: string): string => {
  if (name && name.trim()) {
    return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return email.charAt(0).toUpperCase()
}

const getPlanBadge = (planName: string | null | undefined, language: 'en' | 'zh') => {
  const plan = planName || 'free'
  const badges = {
    free: { label: language === 'zh' ? '免费' : 'Free', variant: 'secondary' as const },
    standard: { label: language === 'zh' ? '标准' : 'Standard', variant: 'default' as const },
    premium: { label: language === 'zh' ? '高级' : 'Premium', variant: 'destructive' as const }
  }
  return badges[plan as keyof typeof badges] || badges.free
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const currentLang = pathname.startsWith('/zh') ? 'zh' : 'en'
  const t = texts[currentLang]

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('登出错误:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleLanguageToggle = () => {
    console.log('语言切换被点击，当前路径:', pathname)
    const newLang = currentLang === 'zh' ? 'en' : 'zh'

    // 更精确的路径处理
    let currentPath = pathname
    if (currentPath.startsWith('/zh/')) {
      currentPath = currentPath.substring(3) // 移除 '/zh'
    } else if (currentPath === '/zh') {
      currentPath = '/'
    }

    // 生成新路径
    let newPath
    if (newLang === 'zh') {
      newPath = currentPath === '/' ? '/zh' : `/zh${currentPath}`
    } else {
      newPath = currentPath === '/' ? '/' : currentPath
    }

    console.log('新语言:', newLang, '新路径:', newPath)
    router.push(newPath)
  }

  const getNavLink = (path: string) => {
    return currentLang === 'zh' ? `/zh${path}` : path
  }

  const navItems = [
    { href: getNavLink('/'), label: t.home },
    { href: getNavLink('/gallery'), label: t.gallery },
    { href: getNavLink('/pricing'), label: t.pricing },
    { href: getNavLink('/help'), label: t.help },
  ]

  // 🚨 修复：简化用户头像渲染逻辑，避免闪烁
  const renderUserAvatar = () => {
    if (status === 'loading') {
      return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    }

    if (!session?.user) {
      return (
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            console.log('🔄 导航栏登录按钮点击')
            // 简化重定向逻辑 - 直接回到当前页面
            const callbackUrl = pathname === '/auth/signin' ? '/' : pathname
            
            console.log('登录重定向URL:', callbackUrl)
            signIn('google', { 
              callbackUrl,
              redirect: true 
            })
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 flex items-center space-x-2"
        >
          <UserCircle className="h-4 w-4" />
          <span>{t.signIn}</span>
        </Button>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-0 hover:bg-transparent">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || session.user.email || 'User'}
                  className="h-full w-full object-cover"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    display: 'block'
                  }}
                  onError={(e) => {
                    // 头像加载失败时显示初始字母
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm ${session.user.image ? 'hidden' : ''}`}>
                {getUserInitials(session.user.name, session.user.email || '')}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center space-x-3 p-4 border-b">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || session.user.email || 'User'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {getUserInitials(session.user.name, session.user.email || '')}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {session.user.email}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge {...getPlanBadge((session.user as any).planName, currentLang)}>
                  {getPlanBadge((session.user as any).planName, currentLang).label}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenuItem asChild>
            <Link href={getNavLink('/profile')} className="flex items-center space-x-2 px-4 py-2">
              <User className="h-4 w-4" />
              <span>{t.profile}</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href={getNavLink('/history')} className="flex items-center space-x-2 px-4 py-2">
              <History className="h-4 w-4" />
              <span>{t.history}</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href={getNavLink('/pricing')} className="flex items-center space-x-2 px-4 py-2">
              <CreditCard className="h-4 w-4" />
              <span>{t.billing}</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href={getNavLink('/support')} className="flex items-center space-x-2 px-4 py-2">
              <Settings className="h-4 w-4" />
              <span>{t.support}</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>{isSigningOut ? t.signingOut : t.signOut}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={getNavLink('/')} className="flex items-center space-x-2">
            <div className="h-8 w-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#1D4ED8', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#3B82F6', stopOpacity:1}} />
                  </linearGradient>
                </defs>
                {/* 苹果风格的圆角矩形背景 */}
                <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#navLogoGradient)"/>
                
                {/* Letter S - 正确方向，放大 */}
                <path d="M6 20 C6 22, 8 24, 10 24 L12 24 C14 24, 16 22, 16 20 C16 18, 14 16, 12 16 L10 16 C8 16, 6 14, 6 12 C6 10, 8 8, 10 8 L12 8 C14 8, 16 10, 16 12" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      fill="none"/>
                
                {/* Letter P - 放大，增加间距 */}
                <path d="M20 8 L20 24 M20 8 L24 8 C26 8, 28 10, 28 12 L28 14 C28 16, 26 18, 24 18 L20 18" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      fill="none"/>
              </svg>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Sybau Picture
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle - Desktop Only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageToggle}
              className="hidden md:flex text-sm text-gray-500 hover:text-gray-700 min-h-[36px] px-3"
            >
              {currentLang === 'zh' ? 'EN' : '中文'}
            </Button>

            {/* User Authentication */}
            {renderUserAvatar()}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 min-h-[44px] min-w-[44px]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-sm">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors font-medium min-h-[44px] flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Language Toggle */}
              <button
                className="block w-full px-4 py-3 text-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors font-medium min-h-[44px] text-left"
                onClick={() => {
                  handleLanguageToggle()
                  setIsMenuOpen(false)
                }}
              >
                {currentLang === 'zh' ? '🌐 Switch to English' : '🌐 切换到中文'}
              </button>

              {/* Mobile Auth */}
              {!session?.user && (
                <div className="border-t pt-4 mt-4">
                  <button
                    className="w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-colors font-medium text-center text-lg min-h-[44px] flex items-center justify-center space-x-2"
                    onClick={() => {
                      console.log('移动端登录按钮被点击')
                      setIsMenuOpen(false)
                      // 简化重定向逻辑 - 直接回到当前页面
                      const callbackUrl = pathname === '/auth/signin' ? '/' : pathname
                      
                      console.log('移动端登录重定向URL:', callbackUrl)
                      signIn('google', { 
                        callbackUrl,
                        redirect: true 
                      })
                    }}
                  >
                    <UserCircle className="h-5 w-5" />
                    <span>{t.signIn}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
