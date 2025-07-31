'use client'

import { EmailSignIn } from '@/components/auth/EmailSignIn'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignUpContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'

  return <EmailSignIn callbackUrl={callbackUrl} mode="signup" />
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  )
}