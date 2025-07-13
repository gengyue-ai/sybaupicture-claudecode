'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Crown, Star, Zap, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'

interface SubscriptionData {
  user: {
    id: string
    email: string
    name: string
    planId?: string
    plan?: {
      id: string
      name: string
      displayName: string
      description: string
      price: number
      maxImagesPerMonth: number
    }
  }
  subscription: any
  usage: {
    current: number
    max: number
    remaining: number
    canGenerate: boolean
  }
  features: {
    maxImagesPerMonth: number
    maxResolution: string
    hasWatermark: boolean
    hasPriorityProcessing: boolean
    hasBatchProcessing: boolean
    hasAdvancedFeatures: boolean
    availableStyles: string[]
  }
}

export default function SubscriptionStatus() {
  const { data: session } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (session) {
      fetchSubscriptionData()
    }
  }, [session])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription')
      const data = await response.json()

      if (response.ok) {
        setSubscriptionData(data)
      } else {
        setError(data.error || 'Failed to fetch subscription data')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return <Star className="w-5 h-5" />
      case 'standard':
        return <Zap className="w-5 h-5" />
      case 'pro':
        return <Crown className="w-5 h-5" />
      default:
        return <Star className="w-5 h-5" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'free':
        return 'bg-gray-100 text-gray-800'
      case 'standard':
        return 'bg-blue-100 text-blue-800'
      case 'pro':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Please sign in to view your subscription status.</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2">Loading subscription status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!subscriptionData) {
    return null
  }

  const { user, usage, features } = subscriptionData
  const planName = user.plan?.name || 'free'
  const usagePercentage = (usage.current / usage.max) * 100

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getPlanColor(planName)}`}>
                {getPlanIcon(planName)}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {user.plan?.displayName || 'Free Plan'}
                </CardTitle>
                <CardDescription>
                  {user.plan?.description || 'Perfect for trying Sybau AI'}
                </CardDescription>
              </div>
            </div>
            <Badge className={getPlanColor(planName)}>
              {planName.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Usage</CardTitle>
          <CardDescription>
            Track your image generation usage this month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Images Generated</span>
            <span className="font-medium">
              {usage.current} / {usage.max}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{usage.remaining} remaining</span>
            <span>{Math.round(usagePercentage)}% used</span>
          </div>

          {usage.remaining <= 3 && usage.remaining > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're running low on image generations. Consider upgrading your plan.
              </AlertDescription>
            </Alert>
          )}

          {!usage.canGenerate && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached your monthly limit. Upgrade to continue generating images.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Up to {features.maxResolution} resolution</span>
            </div>
            <div className="flex items-center space-x-2">
              {features.hasWatermark ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm">
                {features.hasWatermark ? 'Watermarked images' : 'No watermarks'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {features.hasPriorityProcessing ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Priority processing</span>
            </div>
            <div className="flex items-center space-x-2">
              {features.hasBatchProcessing ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Batch processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{features.availableStyles.length} Sybau styles</span>
            </div>
            <div className="flex items-center space-x-2">
              {features.hasAdvancedFeatures ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Advanced AI features</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {planName === 'free' && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-purple-900">
                Ready to unlock more creativity?
              </h3>
              <p className="text-purple-700">
                Upgrade to get more images, higher quality, and premium features.
              </p>
              <Button
                onClick={() => router.push('/pricing')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                View Upgrade Options
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
