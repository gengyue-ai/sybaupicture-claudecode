'use client'

import { EmailSignIn } from '@/components/auth/EmailSignIn'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ZhSignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/zh'

  return <EmailSignIn callbackUrl={callbackUrl} mode="signin" />
}

export default function ZhSignInPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ZhSignInContent />
    </Suspense>
  )
}