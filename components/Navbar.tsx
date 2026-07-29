'use client'

import { useState, useEffect } from 'react'
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
  Image,
  History, 
  CreditCard, 
  Settings
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

// 文本配置
const texts = {
  en: {
    home: 'Home',
    gallery: 'Gallery',
    pricing: 'Pricing',
    help: 'Help',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    signingOut: 'Signing Out...',
    profile: 'Profile',
    assets: 'My Assets',
    history: 'History',
    billing: 'Billing',
    settings: 'Settings',
    syncing: 'Syncing...'
  },
  zh: {
    home: '首页',
    gallery: '画廊',
    pricing: '定价',
    help: '帮助',
    signIn: '登录',
    signUp: '注册',
    signOut: '退出',
    signingOut: '退出中...',
    profile: '个人资料',
    assets: '我的资产',
    history: '历史记录',
    billing: '账单',
    settings: '设置',
    syncing: '同步中...'
  }
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
  const [showAuthButtons, setShowAuthButtons] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // 3秒后如果还在loading，强制显示登录按钮
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        setShowAuthButtons(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [status])

  // 登录成功后重置强制显示状态
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setShowAuthButtons(false)
    }
  }, [status, session])

  const currentLang = pathname.startsWith('/zh') ? 'zh' : 'en'
  const t = texts[currentLang]

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      // 先调用自定义的signout API清除所有cookie
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // 然后调用NextAuth的signOut，但不重定向
      await signOut({ 
        redirect: false
      })
      
      // 最后手动重定向到首页
      const targetUrl = currentLang === 'zh' ? '/zh' : '/'
      window.location.href = targetUrl
    } catch (error) {
      console.error('登出错误:', error)
      // 如果出错，强制刷新页面清除状态
      window.location.href = currentLang === 'zh' ? '/zh' : '/'
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
    // 使用完整页面跳转，避免 RSC 导航导致的无限递归
    window.location.href = newPath
  }

  const getNavLink = (path: string) => {
    return currentLang === 'zh' ? `/zh${path}` : path
  }

  // 基础导航菜单
  const baseNavItems = [
    { href: getNavLink('/'), label: t.home },
    { href: getNavLink('/gallery'), label: t.gallery },
    { href: getNavLink('/pricing'), label: t.pricing },
    { href: getNavLink('/help'), label: t.help },
  ]

  // 根据登录状态动态添加"我的资产"
  const navItems = session?.user 
    ? [...baseNavItems, { href: getNavLink('/profile/assets'), label: t.assets }]
    : baseNavItems

  // 🚨 修复：添加超时处理避免永久loading
  const renderUserAvatar = () => {
    // 如果loading且未超时，显示loading状态（最多3秒）
    if (status === 'loading' && !showAuthButtons) {
      return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    }

    // 如果未登录、loading超时、或者是unauthenticated状态，显示登录按钮
    if (status === 'unauthenticated' || !session?.user || showAuthButtons) {
      return (
        <div className="flex items-center space-x-2">
          <Link href="/auth/signin">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium"
            >
              {t.signIn}
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-sm"
            >
              {t.signUp}
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-0 hover:bg-transparent">
            <UserAvatar
              image={session.user.image}
              name={session.user.name}
              email={session.user.email}
              size="md"
              className="hover:border-gray-300 transition-colors"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center space-x-3 p-4 border-b">
            <UserAvatar
              image={session.user.image}
              name={session.user.name}
              email={session.user.email}
              size="lg"
            />
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
            <Link href={getNavLink('/profile/assets')} className="flex items-center space-x-2 px-4 py-2">
              <Image className="h-4 w-4" />
              <span>{t.assets}</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href={getNavLink('/billing')} className="flex items-center space-x-2 px-4 py-2">
              <CreditCard className="h-4 w-4" />
              <span>{t.billing}</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href={getNavLink('/settings')} className="flex items-center space-x-2 px-4 py-2">
              <Settings className="h-4 w-4" />
              <span>{t.settings}</span>
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
                <div className="border-t pt-4 mt-4 space-y-3">
                  <Link href="/auth/signup">
                    <button
                      className="w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 font-semibold text-center text-lg min-h-[44px] flex items-center justify-center shadow-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCircle className="h-5 w-5 mr-2" />
                      <span>{t.signUp}</span>
                    </button>
                  </Link>
                  <Link href="/auth/signin">
                    <button
                      className="w-full px-4 py-3 text-blue-600 border border-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-center text-lg min-h-[44px] flex items-center justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{t.signIn}</span>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
