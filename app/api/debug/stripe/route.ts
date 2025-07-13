import { NextResponse } from 'next/server'
import { config, getEnvironmentInfo } from '@/lib/config'
import { STRIPE_PRICE_IDS } from '@/lib/stripe'

export async function GET() {
  try {
    const envInfo = getEnvironmentInfo()
    
    const debugConfig = {
      environment: envInfo.environment,
      stripeConfigured: {
        secretKey: !!config.stripe.secretKey,
        publishableKey: !!config.stripe.publicKey,
        webhookSecret: !!config.stripe.webhookSecret,
      },
      priceIds: STRIPE_PRICE_IDS,
      envVars: {
        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
        STRIPE_PRICE_STANDARD_MONTHLY: !!process.env.STRIPE_PRICE_STANDARD_MONTHLY,
        STRIPE_PRICE_STANDARD_YEARLY: !!process.env.STRIPE_PRICE_STANDARD_YEARLY,
        STRIPE_PRICE_PRO_MONTHLY: !!process.env.STRIPE_PRICE_PRO_MONTHLY,
        STRIPE_PRICE_PRO_YEARLY: !!process.env.STRIPE_PRICE_PRO_YEARLY,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      }
    }

    return NextResponse.json(debugConfig)
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
} 