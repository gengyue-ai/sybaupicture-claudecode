import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// 检测当前环境
const isProduction = process.env.NODE_ENV === 'production'

// 服务端Stripe实例 - 支持多种环境变量名称
const stripeSecretKey = isProduction 
  ? (process.env.STRIPE_SECRET_KEY_PROD || process.env.STRIPE_SECRET_KEY)
  : (process.env.STRIPE_SECRET_KEY_DEV || process.env.STRIPE_SECRET_KEY)

let stripe: Stripe | null = null

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-06-30.basil',
    typescript: true
  })
} else {
  console.warn('⚠️ Stripe Secret Key not configured - payment features will be disabled')
}

export { stripe }

// 客户端Stripe实例
export const getStripe = () => {
  const publishableKey = isProduction 
    ? (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_DEV || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  
  if (!publishableKey) {
    console.error('❌ Stripe Publishable Key not configured')
    return null
  }
  return loadStripe(publishableKey)
}

// Stripe价格ID配置 - 从环境变量读取
export const STRIPE_PRICE_IDS = {
  standard: {
    monthly: process.env.STRIPE_PRICE_STANDARD_MONTHLY || 'price_1RhROqG6XuFqUG4898GD54ic', // Standard Monthly
    yearly: process.env.STRIPE_PRICE_STANDARD_YEARLY || 'price_1RhRQBG6XuFqUG48R9UPjFyb'   // Standard Yearly
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1RhRPSG6XuFqUG48PjjCUHkU', // Pro Monthly  
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_1RhRQgG6XuFqUG48RcSOqsAA'   // Pro Yearly
  }
}

// 创建Stripe客户
export async function createStripeCustomer(email: string, name?: string) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  try {
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'sybau-picture'
      }
    })
  } catch (error) {
    console.error('❌ Failed to create Stripe customer:', error)
    throw error
  }
}

// 创建Stripe结算会话
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  userId
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  userId: string
}) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  try {
    console.log('🔄 Creating checkout session:', {
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      userId
    })

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        source: 'sybau-picture'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    })

    console.log('✅ Checkout session created:', session.id)
    return session
  } catch (error) {
    console.error('❌ Failed to create checkout session:', error)
    throw error
  }
}

// 创建Stripe Portal会话（用于管理订阅）
export async function createPortalSession(customerId: string, returnUrl: string) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  try {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    })
  } catch (error) {
    console.error('❌ Failed to create portal session:', error)
    throw error
  }
}

// 取消订阅
export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
  } catch (error) {
    console.error('❌ Failed to cancel subscription:', error)
    throw error
  }
}

// 恢复订阅
export async function resumeSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    })
  } catch (error) {
    console.error('❌ Failed to resume subscription:', error)
    throw error
  }
}

// 获取订阅详情
export async function getSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error('❌ Failed to get subscription:', error)
    throw error
  }
}

// 获取价格详情
export async function getPrice(priceId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  try {
    return await stripe.prices.retrieve(priceId)
  } catch (error) {
    console.error('❌ Failed to get price:', error)
    throw error
  }
}

// 获取产品详情
export async function getProduct(productId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  try {
    return await stripe.products.retrieve(productId)
  } catch (error) {
    console.error('❌ Failed to get product:', error)
    throw error
  }
}

// 验证Webhook签名
export function constructEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('❌ Failed to construct webhook event:', error)
    throw error
  }
}
