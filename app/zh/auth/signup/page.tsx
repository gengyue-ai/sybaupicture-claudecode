'use client'

import { EmailSignIn } from '@/components/auth/EmailSignIn'
import { useSearchParams } from 'next/navigation'

export default function ZhSignUpPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/zh'

  return <EmailSignIn callbackUrl={callbackUrl} mode="signup" />
}