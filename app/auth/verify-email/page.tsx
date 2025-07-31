'use client'

import { EmailVerification } from '@/components/auth/EmailVerification'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  const email = searchParams?.get('email')

  return <EmailVerification token={token || undefined} email={email || undefined} />
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}