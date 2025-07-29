'use client'

import { EmailVerification } from '@/components/auth/EmailVerification'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  const email = searchParams?.get('email')

  return <EmailVerification token={token || undefined} email={email || undefined} />
}