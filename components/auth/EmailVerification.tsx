'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

type VerificationStatus = 'verifying' | 'success' | 'error' | 'expired'

interface EmailVerificationProps {
  token?: string
  email?: string
}

export function EmailVerification({ token, email }: EmailVerificationProps) {
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const verificationToken = token || searchParams?.get('token')
  const verificationEmail = email || searchParams?.get('email')

  useEffect(() => {
    if (verificationToken && verificationEmail) {
      verifyEmail(verificationToken, verificationEmail)
    }
  }, [verificationToken, verificationEmail])

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  const verifyEmail = async (token: string, email: string) => {
    try {
      setStatus('verifying')
      
      // 调用真实的邮箱验证API
      const response = await fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setStatus('success')
        toast.success('邮箱验证成功！正在跳转...')
        
        // 延迟跳转到主页
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        console.error('Email verification failed:', result)
        
        if (result.code === 'TOKEN_EXPIRED') {
          setStatus('expired')
        } else if (result.code === 'ALREADY_VERIFIED') {
          setStatus('success')
          toast.success('邮箱已验证！')
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
        } else {
          setStatus('error')
          toast.error(result.message || '邮箱验证失败')
        }
      }
      
    } catch (error) {
      console.error('Email verification error:', error)
      setStatus('error')
      toast.error('验证过程中发生错误')
    }
  }

  const handleResendEmail = async () => {
    if (!verificationEmail || isResending) return

    setIsResending(true)
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationEmail
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('验证邮件已重新发送，请查收邮箱')
        setCountdown(60)
        setCanResend(false)
      } else {
        toast.error(result.message || '重发邮件失败，请稍后重试')
      }
    } catch (error) {
      console.error('Resend email error:', error)
      toast.error('重发邮件失败，请稍后重试')
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Mail className="h-16 w-16 text-gray-400" />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return '正在验证邮箱...'
      case 'success':
        return '邮箱验证成功！'
      case 'expired':
        return '验证链接已过期'
      case 'error':
        return '验证失败'
      default:
        return '邮箱验证'
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case 'verifying':
        return '请稍候，我们正在验证您的邮箱地址...'
      case 'success':
        return '您的邮箱已成功验证，正在为您跳转到主页...'
      case 'expired':
        return '此验证链接已过期。请重新获取验证邮件。'
      case 'error':
        return '邮箱验证过程中出现了问题。请重试或联系客服。'
      default:
        return '验证您的邮箱地址以继续使用 Sybau Picture'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {getStatusDescription()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {verificationEmail && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{verificationEmail}</span>
              </div>
            </div>
          )}

          {(status === 'expired' || status === 'error') && verificationEmail && (
            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                disabled={!canResend || isResending}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    发送中...
                  </>
                ) : canResend ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重新发送验证邮件
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重新发送 ({countdown}s)
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/signin')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  返回登录页面
                </Button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <Button
                onClick={() => router.push('/')}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                立即开始使用
              </Button>
            </div>
          )}

          {status === 'verifying' && !verificationToken && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                请检查您的邮箱并点击验证链接
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signin')}
                className="text-gray-600 hover:text-gray-800"
              >
                返回登录页面
              </Button>
            </div>
          )}

          {/* 帮助信息 */}
          <div className="text-center text-xs text-gray-500 mt-6 space-y-2">
            <p>没有收到邮件？请检查垃圾邮件文件夹</p>
            <p>或联系客服：support@sybaupicture.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}