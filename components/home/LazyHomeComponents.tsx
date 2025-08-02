'use client'

import { Suspense, lazy } from 'react'

// 懒加载各个首页组件
const FluxEngineSection = lazy(() => import('./FluxEngineSection').then(module => ({ default: module.FluxEngineSection })))
const ComparisonSection = lazy(() => import('./ComparisonSection').then(module => ({ default: module.ComparisonSection })))
const HowItWorksSection = lazy(() => import('./HowItWorksSection').then(module => ({ default: module.HowItWorksSection })))
const FeaturesSection = lazy(() => import('./FeaturesSection').then(module => ({ default: module.FeaturesSection })))

// 加载中占位符组件
function SectionSkeleton({ height = 'h-96' }: { height?: string }) {
  return (
    <div className={`${height} bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-lg`}>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 space-y-3">
                <div className="h-12 w-12 bg-gray-300 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface LazyHomeComponentsProps {
  currentLang: 'en' | 'zh'
}

export function LazyFluxEngineSection({ currentLang }: LazyHomeComponentsProps) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <FluxEngineSection currentLang={currentLang} />
    </Suspense>
  )
}

export function LazyComparisonSection({ currentLang }: LazyHomeComponentsProps) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <ComparisonSection currentLang={currentLang} />
    </Suspense>
  )
}

export function LazyHowItWorksSection({ currentLang }: LazyHomeComponentsProps) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <HowItWorksSection currentLang={currentLang} />
    </Suspense>
  )
}

export function LazyFeaturesSection({ currentLang }: LazyHomeComponentsProps) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <FeaturesSection currentLang={currentLang} />
    </Suspense>
  )
}