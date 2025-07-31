'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Star, Sparkles, Zap, Crown, Shield, Users, Rocket, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from '@/hooks/use-toast'

const getPricingPlans = (isAnnual: boolean) => [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    originalPrice: null,
    yearlyPrice: null,
    period: 'forever',
    description: 'Perfect for trying Sybau AI',
    badge: null,
    features: [
      '3 images per month',
      '✨ Access to ALL templates',
      'Standard quality (1024x1024)',
      'No watermarks',
      'Community gallery access'
    ],
    limitations: [
      'Limited monthly usage'
    ],
    buttonText: 'Get Started Free',
    buttonVariant: 'outline' as const,
    popular: false,
    icon: Star
  },
  {
    id: 'standard',
    name: 'Standard',
    price: isAnnual ? '$6' : '$9',
    originalPrice: isAnnual ? '$9' : null,
    yearlyPrice: isAnnual ? '$72/year' : null,
    period: isAnnual ? '/month' : '/month',
    description: 'Perfect for regular creators',
    badge: null,
    features: [
      '60 images per month',
      '✨ Access to ALL templates',
      'High quality (up to 1536x1536)',
      'No watermarks',
      'All Sybau styles',
      'Multiple download formats'
    ],
    limitations: [
      'Monthly usage limit'
    ],
    buttonText: 'Choose Standard',
    buttonVariant: 'default' as const,
    popular: false,
    icon: Zap
  },
  {
    id: 'pro',
    name: 'Professional',
    price: isAnnual ? '$12' : '$19',
    originalPrice: isAnnual ? '$19' : null,
    yearlyPrice: isAnnual ? '$144/year' : null,
    period: isAnnual ? '/month' : '/month',
    description: 'For professional creators',
    badge: 'Most Popular',
    features: [
      '180 images per month',
      '✨ Access to ALL templates',
      'Ultra quality (up to 2048x2048)',
      'No watermarks',
      'All premium Sybau styles',
      'Priority processing',
      'Advanced AI features'
    ],
    limitations: [],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const,
    popular: true,
    icon: Crown
  }
]

const faqs = [
  {
    question: 'How do image limits work?',
    answer: 'Each plan includes a specific number of image generation credits. Free users get basic experience quota, Standard users get 60 images per month, and Pro users get 180 images per month.'
  },
  {
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades will take effect at the next billing cycle.'
  },
  {
    question: 'What happens if I exceed my image limit?',
    answer: 'If you reach your monthly limit, you can upgrade your plan to continue creating amazing content. Free users can upgrade to unlock more features and higher quotas.'
  },
  {
    question: 'Are there any hidden fees?',
    answer: 'No, our pricing is completely transparent. The price you see is what you pay, with no hidden fees or charges.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. You will continue to have access to your plan features until the end of your current billing period.'
  }
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [userDataLoading, setUserDataLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const pricingPlans = getPricingPlans(isAnnual)
  const router = useRouter()

  // Get user's current plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          const response = await fetch('/api/subscription')
          if (response.ok) {
            const data = await response.json()
            setUserPlan(data.user?.plan?.name || 'free')
            console.log('✅ Pricing page - User plan:', data.user?.plan?.name)
          } else {
            setUserPlan('free')
          }
        } catch (error) {
          console.error('Failed to fetch user plan:', error)
          setUserPlan('free')
        }
      } else if (status === 'unauthenticated') {
        setUserPlan(null) // Unauthenticated user
      }
      setUserDataLoading(false)
    }

    if (status !== 'loading') {
      fetchUserPlan()
    }
  }, [status, session])

  // Dynamic button text based on user plan
  const getButtonText = (planId: string) => {
    if (userDataLoading || status === 'loading') return 'Loading...'
    
    if (userPlan === planId) {
      return 'Current Plan'
    }
    
    switch (planId) {
      case 'free':
        return 'Get Started Free'
      case 'standard':
        return userPlan === 'free' ? 'Upgrade to Standard' : 'Choose Standard'
      case 'pro':
        return userPlan === 'free' ? 'Upgrade to Pro' : userPlan === 'standard' ? 'Upgrade to Pro' : 'Choose Pro'
      default:
        return 'Choose Plan'
    }
  }

  const handlePlanClick = async (planId: string) => {
    // 防止重复点击 - 如果已有支付在进行中
    if (paymentLoading !== null) {
      console.log('🔄 支付已在进行中，忽略重复点击')
      return
    }

    if (planId === 'free') {
      // Free plan: redirect to sign in if not logged in, otherwise go to home
      if (!session) {
        router.push('/auth/signin?callbackUrl=/')
      } else {
        router.push('/')
      }
      return
    }

    // Check if user is logged in first
    if (status === 'loading') {
      return
    }

    if (!session) {
      // Unauthenticated users must sign in first
      toast({
        title: "Please sign in",
        description: "You need to sign in to view your plan information and make purchases",
        variant: "destructive"
      })
      router.push(`/auth/signin?callbackUrl=/pricing?plan=${planId}`)
      return
    }

    // Check if user already has this plan
    if (userPlan === planId) {
      toast({
        title: "Already subscribed",
        description: `You are already a ${planId.toUpperCase()} user, no need to purchase again`,
        variant: "default"
      })
      return
    }

    // User is logged in and doesn't have this plan, proceed to checkout
    setPaymentLoading(planId)
    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: planId,
          billingCycle: isAnnual ? 'yearly' : 'monthly'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('支付系统错误:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          details: data.details,
          code: data.code,
          debug: data.debug
        })
        
        // 根据错误类型提供更友好的提示
        let errorMessage = data.error || 'Failed to create checkout session'
        if (data.code === 'STRIPE_NOT_CONFIGURED') {
          errorMessage = 'Payment system is currently unavailable. Please try again later or contact support.'
        } else if (data.code === 'STRIPE_PRICE_CONFIG_INCOMPLETE') {
          errorMessage = 'Payment configuration error. Please contact support.'
        } else if (data.details) {
          errorMessage = data.details
        }
        
        throw new Error(errorMessage)
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : 'Failed to create checkout session, please try again',
        variant: "destructive"
      })
    } finally {
      setPaymentLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Simple & Transparent Pricing
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Unlock Sybau AI's Full Potential
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your creative needs. Generate stunning Sybau images with our AI-powered platform.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-lg border relative">
              <div className="flex items-center relative">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    !isAnnual
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    isAnnual
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Yearly
                </button>
              </div>
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-green-500 text-white text-xs px-2 py-1 shadow-lg">
                  Save up to 37%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon
            return (
              <Card key={plan.id} className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg scale-105' : ''}`}>
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-sm font-medium">
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-600">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-500 line-through mb-2">
                      {plan.originalPrice}{plan.period}
                    </div>
                  )}
                  {plan.yearlyPrice && isAnnual && (
                    <div className="text-sm text-gray-600 mb-2">
                      {plan.yearlyPrice}
                    </div>
                  )}
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <Button
                    className={`w-full mb-6 ${plan.popular ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}`}
                    variant={userPlan === plan.id ? 'outline' : plan.buttonVariant}
                    size="lg"
                    onClick={() => handlePlanClick(plan.id)}
                    disabled={userPlan === plan.id || paymentLoading !== null}
                  >
                    {paymentLoading === plan.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {getButtonText(plan.id)}
                  </Button>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-500 mb-2">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, idx) => (
                            <li key={idx} className="flex items-start">
                              <X className="w-4 h-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Creating?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of creators using Sybau AI to bring their ideas to life.
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100" onClick={() => router.push('/')}>
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  )
}