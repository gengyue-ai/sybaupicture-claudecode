'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { getCurrentLanguageFromPath } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Mail, Loader2, User, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface EmailSignInProps {
  callbackUrl?: string
  mode?: 'signin' | 'signup'
}

// 国际化文本
const i18n = {
  zh: {
    // 标题和描述
    signInTitle: '登录',
    signUpTitle: '创建账户',
    signInDesc: '欢迎回到 Sybau Picture',
    signUpDesc: '加入Sybau Picture，开始创作AI图像',

    // 表单标签
    name: '姓名',
    email: '邮箱',
    password: '密码',

    // 占位符
    namePlaceholder: '请输入您的姓名',
    emailPlaceholder: '请输入邮箱地址',
    passwordPlaceholder: '请输入密码（至少6位）',

    // 按钮
    signUp: '创建账户',
    signIn: '登录',
    signUpLoading: '创建账户中...',
    signInLoading: '登录中...',
    googleSignUp: '使用 Google 注册',
    googleSignIn: '使用 Google 登录',

    // 链接 - 只在相反场景显示
    hasAccountText: '已有账户？',
    hasAccountLink: '立即登录',
    noAccountText: '新用户？',
    noAccountLink: '立即注册',

    // 分隔符
    orContinue: '或使用社交媒体注册',
    orSignIn: '或继续使用',

    // 法律条款
    termsText: '继续即表示您同意我们的',
    termsLink: '服务条款',
    privacyLink: '隐私政策',

    // 错误消息
    nameRequired: '请输入姓名',
    emailRequired: '请输入邮箱地址',
    emailInvalid: '请输入有效的邮箱地址',
    passwordRequired: '请输入密码',
    passwordTooShort: '密码至少需要6位',
    registerFailed: '注册失败，请稍后重试',
    loginFailed: '邮箱或密码错误，请检查后重试',
    googleFailed: 'Google注册失败',
    generalError: '操作失败，请稍后重试',


    // 成功消息
    registerSuccess: '注册成功！正在跳转...',
    loginSuccess: '登录成功！正在跳转...',
    autoLoginFailed: '注册成功但登录失败，请尝试登录'
  },
  en: {
    // 标题和描述
    signInTitle: 'Sign In',
    signUpTitle: 'Create Account',
    signInDesc: 'Welcome back to Sybau Picture',
    signUpDesc: 'Join Sybau Picture to start creating AI images',

    // 表单标签
    name: 'Name',
    email: 'Email',
    password: 'Password',

    // 占位符
    namePlaceholder: 'Enter your name',
    emailPlaceholder: 'Enter your email address',
    passwordPlaceholder: 'Enter your password (at least 6 characters)',

    // 按钮
    signUp: 'Create Account',
    signIn: 'Sign In',
    signUpLoading: 'Creating account...',
    signInLoading: 'Signing in...',
    googleSignUp: 'Continue with Google',
    googleSignIn: 'Continue with Google',

    // 链接 - 只在相反场景显示
    hasAccountText: 'Already have an account?',
    hasAccountLink: 'Sign in',
    noAccountText: "Don't have an account?", 
    noAccountLink: 'Sign up',

    // 分隔符
    orContinue: 'Or continue with',
    orSignIn: 'Or continue with',

    // 法律条款
    termsText: 'By continuing, you agree to our',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',

    // 错误消息
    nameRequired: 'Please enter your name',
    emailRequired: 'Please enter your email',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Please enter your password',
    passwordTooShort: 'Password must be at least 6 characters',
    registerFailed: 'Registration failed, please try again',
    loginFailed: 'Invalid email or password, please check and try again',
    googleFailed: 'Google sign up failed',
    generalError: 'Something went wrong, please try again',


    // 成功消息
    registerSuccess: 'Registration successful! Redirecting...',
    loginSuccess: 'Login successful! Redirecting...',
    autoLoginFailed: 'Registration successful but auto-login failed, please try logging in'
  }
}

export function EmailSignIn({ callbackUrl, mode = 'signin' }: EmailSignInProps) {
  const pathname = usePathname()
  const currentLang = getCurrentLanguageFromPath(pathname || '/')
  const t = i18n[currentLang]

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState(mode)
  const [showUserExistsGuide, setShowUserExistsGuide] = useState(false)


  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error(t.emailRequired)
      return
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error(t.emailInvalid)
      return
    }

    if (currentMode === 'signup' && !name.trim()) {
      toast.error(t.nameRequired)
      return
    }

    if (!password.trim()) {
      toast.error(t.passwordRequired)
      return
    }

    if (password.length < 6) {
      toast.error(t.passwordTooShort)
      return
    }

    setIsLoading(true)

    try {
      if (currentMode === 'signup') {
        console.log('🚀 开始注册请求:', { email: email.trim(), name: name.trim() })
        
        // 注册模式：创建新用户
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password
          })
        })

        console.log('📥 注册响应状态:', registerResponse.status, registerResponse.statusText)

        let registerData
        try {
          registerData = await registerResponse.json()
          console.log('📋 注册响应数据:', registerData)
        } catch (parseError) {
          console.error('❌ 解析响应JSON失败:', parseError)
          toast.error(currentLang === 'zh' ? '服务器响应格式错误' : 'Invalid server response')
          setIsLoading(false)
          return
        }

        if (!registerResponse.ok) {
          console.error('❌ 注册失败，响应状态:', registerResponse.status)
          console.error('❌ 注册失败详情:', registerData)

          // 🎯 处理服务器错误 (500)
          if (registerResponse.status === 500) {
            console.error('🚨 服务器内部错误:', registerData)
            let errorMessage = currentLang === 'zh' ? '服务器暂时不可用，请稍后重试' : 'Server temporarily unavailable, please try again later'
            
            // 检查是否是数据库相关错误
            if (registerData.error?.includes('Database') || registerData.code === 'DB_QUERY_ERROR') {
              errorMessage = currentLang === 'zh' ? '数据库连接异常，请稍后重试' : 'Database connection error, please try again later'
            }
            
            toast.error(errorMessage, { duration: 5000 })
            setIsLoading(false)
            return
          }

          // 🎯 处理用户已存在的情况 - 改进提示逻辑
          if (registerResponse.status === 422 && (registerData.code === 'USER_EXISTS' || registerData.error === 'User already exists')) {
            console.log('🔍 检测到用户已存在:', { 
              status: registerResponse.status, 
              code: registerData.code, 
              error: registerData.error,
              showUserExistsGuide: showUserExistsGuide
            })
            
            // 简洁的提示信息
            toast.error(currentLang === 'zh' ? '用户已存在' : 'User already exists')
            
            // 显示登录引导
            setShowUserExistsGuide(true)
            console.log('✅ 已设置showUserExistsGuide为true')
            return
          }

          // 其他错误情况
          let errorMessage = t.registerFailed
          if (registerData.error) {
            // 翻译常见的英文错误信息
            if (registerData.error.includes('Invalid email format')) {
              errorMessage = currentLang === 'zh' ? '邮箱格式无效' : 'Invalid email format'
            } else if (registerData.error.includes('Password must be at least')) {
              errorMessage = currentLang === 'zh' ? '密码至少需要6位' : 'Password must be at least 6 characters'
            } else if (registerData.error.includes('Database')) {
              errorMessage = currentLang === 'zh' ? '服务器暂时不可用，请稍后重试' : 'Server temporarily unavailable, please try again later'
            } else {
              errorMessage = registerData.error
            }
          }

          toast.error(errorMessage)
          setIsLoading(false)
          return
        }

        // 🎯 处理账户增强成功的情况
        if (registerData.code === 'PASSWORD_ADDED_TO_OAUTH') {
          console.log('✨ OAuth账户增强成功:', registerData)
          
          toast.success(registerData.message || '账户功能已增强', {
            duration: 5000,
            description: registerData.details || '您现在可以使用多种方式登录'
          })
          
          // 直接使用新添加的密码登录
          setTimeout(async () => {
            console.log('🔐 使用新密码自动登录...')
            const result = await signIn('credentials', {
              email: email.trim(),
              password: password,
              callbackUrl: callbackUrl || '/',
              redirect: false,
            })
            
            if (result?.error) {
              console.error('❌ 自动登录失败:', result.error)
              toast.error(currentLang === 'zh' ? '自动登录失败，请手动登录' : 'Auto login failed, please sign in manually')
            } else {
              console.log('✅ 自动登录成功')
              window.location.href = callbackUrl || '/'
            }
          }, 1000)
          
          return
        }

        console.log('✅ 用户注册成功:', registerData)

        // 注册成功，自动登录
        console.log('🔐 开始自动登录...')
        const result = await signIn('credentials', {
          email: email.trim(),
          password: password,
          callbackUrl: callbackUrl || '/',
          redirect: false,
        })

        console.log('🔐 登录结果:', result)

        if (result?.error) {
          console.error('❌ 自动登录失败:', result.error)
          toast.error(t.autoLoginFailed)
        } else {
          console.log('✅ 注册并登录成功，准备跳转')
          toast.success(t.registerSuccess)
          // 跳转
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = callbackUrl || '/'
            }
          }, 1000)
        }
      } else {
        // 登录模式：使用credentials provider
        console.log('🔐 开始登录验证...')
        const result = await signIn('credentials', {
          email: email.trim(),
          password: password,
          callbackUrl: callbackUrl || '/',
          redirect: false,
        })

        console.log('🔐 登录结果:', result)

        if (result?.error) {
          console.error('❌ 登录失败:', result.error)

          // 🔥 检查是否是邮箱未验证导致的登录失败
          if (result.error === 'CredentialsSignin') {
            // 可能是邮箱未验证，需要检查用户状态
            try {
              const checkResponse = await fetch('/api/auth/check-email-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
              })
              
              if (checkResponse.ok) {
                const checkData = await checkResponse.json()
                if (checkData.exists && !checkData.emailVerified) {
                  // 邮箱未验证
                  toast.error(currentLang === 'zh' ? '邮箱未验证，请查收验证邮件' : 'Email not verified, please check your verification email')
                  setIsLoading(false)
                  
                  setTimeout(() => {
                    toast.info(
                      currentLang === 'zh' 
                        ? '没收到邮件？点击重新发送验证邮件' 
                        : 'Did not receive email? Click to resend verification email',
                      {
                        duration: 8000,
                        action: {
                          label: currentLang === 'zh' ? '重新发送' : 'Resend',
                          onClick: async () => {
                            try {
                              const resendResponse = await fetch('/api/auth/verify-email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: email.trim() })
                              })
                              if (resendResponse.ok) {
                                toast.success(currentLang === 'zh' ? '验证邮件已重新发送' : 'Verification email resent')
                              }
                            } catch (error) {
                              toast.error(currentLang === 'zh' ? '重新发送失败' : 'Failed to resend')
                            }
                          }
                        }
                      }
                    )
                  }, 2000)
                  return
                }
              }
            } catch (error) {
              console.error('检查邮箱状态失败:', error)
            }
            
            // 如果不是邮箱验证问题，显示常规错误
            toast.error(currentLang === 'zh' ? '邮箱或密码错误，请检查后重试' : 'Invalid email or password')
            setIsLoading(false)
          } else if (result.error === 'AccessDenied') {
            toast.error(currentLang === 'zh' ? '账户被禁用，请联系客服' : 'Account disabled, please contact support')
            setIsLoading(false)
          } else if (result.error === 'Configuration') {
            toast.error(currentLang === 'zh' ? '登录服务配置错误，请稍后重试' : 'Login service error, please try again later')
            setIsLoading(false)
          } else {
            toast.error(t.loginFailed)
            setIsLoading(false)
          }

          // 如果是邮箱不存在的情况，提示用户注册
          if (result.error === 'CredentialsSignin' && currentMode === 'signin') {
            setTimeout(() => {
              const helpMessage = currentLang === 'zh' ? '如果您还没有账户，可以点击下方注册' : 'If you don\'t have an account, you can sign up below'
              toast.info(helpMessage)
            }, 5000)
          }
        } else {
          console.log('✅ 登录成功，准备跳转')
          toast.success(t.loginSuccess)
          // 跳转
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = callbackUrl || '/'
            }
          }, 1000)
        }
      }
    } catch (error: any) {
      console.error('❌ 注册/登录网络错误:', error)
      
      // 检查是否是网络连接问题
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error(currentLang === 'zh' ? '网络连接失败，请检查网络后重试' : 'Network connection failed, please check your connection')
      } else if (error.name === 'AbortError') {
        toast.error(currentLang === 'zh' ? '请求超时，请重试' : 'Request timeout, please try again')
      } else {
        toast.error(currentLang === 'zh' ? '操作失败，请稍后重试' : 'Operation failed, please try again later')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)

    try {
      await signIn('google', {
        callbackUrl: callbackUrl || '/',
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error(t.googleFailed)
      setIsGoogleLoading(false)
    }
  }

  const toggleMode = () => {
    setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin')
    setName('')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 px-4 pt-16 pb-12">
      <Card className="w-full max-w-sm bg-white shadow-lg">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-3">
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm"></div>
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {currentMode === 'signup' ? t.signUpTitle : t.signInTitle}
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            {currentMode === 'signup' ? t.signUpDesc : t.signInDesc}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 px-5">
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            {currentMode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t.name}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t.email}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* 密码输入框 */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t.password}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="pr-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 忘记密码链接 - 只在登录模式显示 */}
            {currentMode === 'signin' && (
              <div className="text-right">
                <Link 
                  href={currentLang === 'zh' ? '/zh/auth/forgot-password' : '/auth/forgot-password'}
                  className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  {currentLang === 'zh' ? '忘记密码？' : 'Forgot password?'}
                </Link>
              </div>
            )}

            <div className="text-center pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentMode === 'signup' ? t.signUpLoading : t.signInLoading}
                  </>
                ) : (
                  currentMode === 'signup' ? t.signUp : t.signIn
                )}
              </Button>
            </div>
          </form>



          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                {currentMode === 'signup' ? t.orContinue : t.orSignIn}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full h-10 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {currentMode === 'signup' ? t.googleSignUp : t.googleSignIn}
          </Button>

          {/* 账号切换区域 - 修复重复显示问题 */}
          <div className="text-center text-sm text-gray-600 mt-3">
            {showUserExistsGuide && currentMode === 'signup' ? (
              /* 用户已存在引导 */
              <>
                {t.hasAccountText}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMode('signin')
                    setShowUserExistsGuide(false)
                  }}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  {t.hasAccountLink}
                </button>
              </>
            ) : (
              /* 正常的模式切换 */
              <>
                {currentMode === 'signup' ? (
                  /* 注册界面显示：已有账户？立即登录 */
                  <>
                    {t.hasAccountText}{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      {t.hasAccountLink}
                    </button>
                  </>
                ) : (
                  /* 登录界面显示：新用户？立即注册 */
                  <>
                    {t.noAccountText}{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      {t.noAccountLink}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* 法律条款 - 在最底部 */}
          <div className="text-center text-xs text-gray-500 mt-4">
            {t.termsText}{' '}
            <Link href={currentLang === 'zh' ? "/zh/terms" : "/terms"} className="text-blue-600 hover:underline">
              {t.termsLink}
            </Link>{' '}
            {currentLang === 'zh' ? '和' : 'and'}{' '}
            <Link href={currentLang === 'zh' ? "/zh/privacy" : "/privacy"} className="text-blue-600 hover:underline">
              {t.privacyLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}