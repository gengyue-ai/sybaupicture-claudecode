'use client'

import { EmailSignIn } from '@/components/auth/EmailSignIn'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ZhSignUpContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/zh'

  return <EmailSignIn callbackUrl={callbackUrl} mode="signup" />
}

export default function ZhSignUpPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ZhSignUpContent />
    </Suspense>
  )
}