'use client'

import { EmailSignIn } from '@/components/auth/EmailSignIn'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'

  return <EmailSignIn callbackUrl={callbackUrl} mode="signin" />
}
