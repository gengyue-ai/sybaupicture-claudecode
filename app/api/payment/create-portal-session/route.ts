import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createPortalSession } from '@/lib/stripe'
import { getCurrentUserWithSubscription } from '@/lib/subscription'

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 获取用户信息
    const user = await getCurrentUserWithSubscription()
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer ID found' },
        { status: 404 }
      )
    }

    // 创建客户门户会话
    const portalSession = await createPortalSession(
      user.stripeCustomerId,
      `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`
    )

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
