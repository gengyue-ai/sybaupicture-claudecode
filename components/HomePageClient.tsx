'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider'
import { ArrowRight, Sparkles, Rocket, Star, TrendingUp, Heart, Users, Shield, Clock, Award, Check, Play } from 'lucide-react'
import { useSession, getSession } from 'next-auth/react'
import { getText, type TextKey } from '@/lib/staticTexts'
import { 
  LazyFluxEngineSection, 
  LazyComparisonSection, 
  LazyHowItWorksSection, 
  LazyFeaturesSection 
} from '@/components/home/LazyHomeComponents'

// 移动端优化的懒加载 - 根据设备性能调整加载时机
const ImageGenerator = lazy(() => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      // 平衡性能和用户体验的延迟时间
      const isMobile = window.innerWidth <= 768
      const delay = isMobile ? 2500 : 2000
      
      const loadComponent = () => {
        import('@/components/ImageGenerator').then(resolve)
      }
      
      if (isMobile) {
        // 移动端使用setTimeout而不是requestIdleCallback（性能更好）
        setTimeout(loadComponent, delay)
      } else {
        requestIdleCallback(loadComponent, { timeout: delay })
      }
    } else {
      import('@/components/ImageGenerator').then(resolve)
    }
  })
})

const UnifiedScenarioShowcase = lazy(() => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      // 合理的延迟加载时间
      const isMobile = window.innerWidth <= 768
      const delay = isMobile ? 3500 : 3000
      
      setTimeout(() => {
        import('@/components/UnifiedScenarioShowcase').then(resolve)
      }, delay)
    } else {
      import('@/components/UnifiedScenarioShowcase').then(resolve)
    }
  })
})

// 加载占位符组件
function GeneratorSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShowcaseSkeleton() {
  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePageClient() {
  const pathname = usePathname()
  const router = useRouter()
  const [stats, setStats] = useState({ memes: 125000, rating: 4.9, countries: 180 })
  const { data: session, status } = useSession()
  
  // 临时简化状态管理，避免复杂的useEffect逻辑
  // useEffect(() => {
  //   if (pathname === '/' || pathname === '/zh') {
  //     console.log('🏠 用户访问首页，保持页面状态')
  //     return
  //   }
  // }, [pathname])

  const handleCaseClick = (zhPrompt: string, enPrompt: string) => {
    // 滚动到生成器区域
    const generatorElement = document.querySelector('#generator-section')
    if (generatorElement) {
      generatorElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // 延迟一点时间，确保滚动完成后再设置prompt
      setTimeout(() => {
        const promptInput = document.querySelector('textarea[placeholder*="prompt"]') as HTMLTextAreaElement
        if (promptInput) {
          const prompt = currentLang === 'zh' ? zhPrompt : enPrompt
          promptInput.value = prompt
          promptInput.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }, 1000)
    }
  }

  const handlePlanClick = (planType: 'free' | 'standard' | 'professional') => {
    const currentLang = getCurrentLanguage()

    if (planType === 'free') {
      // 免费版：如果未登录引导登录，已登录滚动到生成器
      if (!session) {
        const signInPath = currentLang === 'zh' ? '/zh/auth/signin' : '/auth/signin'
        router.push(signInPath)
      } else {
        // 滚动到生成器区域
        const generatorElement = document.querySelector('#generator-section')
        if (generatorElement) {
          generatorElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    } else {
      // 付费版跳转到对应语言的定价页面
      const pricingPath = currentLang === 'zh' ? '/zh/pricing' : '/pricing'
      // 修复套餐ID映射问题：professional -> pro
      const planId = planType === 'professional' ? 'pro' : planType
      router.push(`${pricingPath}?plan=${planId}`)
    }
  }

  const getCurrentLanguage = () => {
    const segments = pathname.split('/').filter(Boolean)
    const supportedLanguages = ['zh']

    if (segments.length === 0) return 'en'
    if (supportedLanguages.includes(segments[0])) return segments[0]
    return 'en'
  }

  const currentLang = getCurrentLanguage()

  // 使用优化的静态文本函数
  const getLocalizedText = (key: TextKey, fallback?: string) => {
    return getText(currentLang as 'en' | 'zh', key, fallback)
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-300/10 to-cyan-400/10"></div>

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            {/* Left Content */}
            <div className="text-left">
              {/* FLUX Engine Badge */}
              <div className="mb-6">
                <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {getLocalizedText('home.hero.badge', 'FLUX AI Engine Powered')}
                </Badge>
              </div>

              {/* Main Title - SEO Optimized */}
              <div className="mb-6">
                {/* Primary H1 - SEO optimized with core keywords */}
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-gray-900 leading-tight">
                  {getLocalizedText('home.hero.title', 'Sybau FLUX Pro Picture Generator')}
                </h1>
                
                {/* Secondary tagline */}
                <h2 className="text-2xl lg:text-3xl font-medium mb-3 text-gray-700 leading-tight">
                  {getLocalizedText('home.hero.subtitle', 'Professional AI Image Editor')}
                </h2>
                
                {/* Technology Feature */}
                <h3 className="text-xl lg:text-2xl font-medium mb-4 leading-tight">
                  {currentLang === 'zh' ? '基于' : 'Powered by'} <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent font-bold">{getLocalizedText('home.hero.tagline', 'FLUX Pro Engine')}</span>
                </h3>
              </div>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {getLocalizedText('home.hero.description', 'Powered by FLUX Pro/Kontext AI engine - Transform any text or image into stunning creative visuals! 9 practical scenarios, 15-second generation, professional commercial quality.')}
              </p>

              {/* Key Features */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
                {[
                  { icon: <Star className="w-4 h-4" />, text: getLocalizedText('home.flux.param12b', '12B Parameters') },
                  { icon: <Rocket className="w-4 h-4" />, text: getLocalizedText('home.benefits.speed', '15s Generation') },
                  { icon: <Heart className="w-4 h-4" />, text: getLocalizedText('home.benefits.scenarios', '9 Scenarios') },
                  { icon: <TrendingUp className="w-4 h-4" />, text: getLocalizedText('home.benefits.quality', 'Pro Quality') }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-sm rounded-full px-2.5 sm:px-3 py-1.5 shadow-md flex-shrink-0">
                    <div className="text-purple-600">{feature.icon}</div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <button 
                  onClick={() => {
                    const generatorElement = document.querySelector('#generator-section')
                    if (generatorElement) {
                      generatorElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-center"
                >
                  {getLocalizedText('home.cta.startCreating', 'Start Creating Now')}
                </button>
                <div className="text-sm text-gray-500 py-3 sm:py-4 text-center sm:text-left w-full sm:w-auto">
                  {getLocalizedText('home.socialProof', 'Trusted by creators worldwide')}
                </div>
              </div>
            </div>

            {/* Right Visual Showcase */}
            <div className="relative lg:pl-8">
              {/* Main showcase container with floating elements */}
              <div className="relative">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl transform rotate-3 opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl transform -rotate-2 opacity-60"></div>
                
                {/* Main content area with Before/After Slider */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
                  <BeforeAfterSlider
                    beforeImage="/images/hero-showcase/hero-removal-before.webp"
                    afterImage="/images/hero-showcase/hero-removal-after.webp"
                    beforeLabel={getLocalizedText('home.cases.before', 'Before')}
                    afterLabel={getLocalizedText('home.cases.after', 'After')}
                    className="w-full rounded-xl overflow-hidden shadow-lg"
                    width={600}
                    height={400}
                  />
                  
                  {/* Tool icons and indicators */}
                  <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{getLocalizedText('home.hero.smart.removal', 'Smart Removal')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">{getLocalizedText('home.hero.smart.done', '15s Done')}</span>
                    </div>
                  </div>
                </div>

                {/* Floating tool indicators */}
                <div className="absolute -top-4 -right-4 bg-purple-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                  <Sparkles className="w-5 h-5" />
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-cyan-500 text-white p-3 rounded-full shadow-lg">
                  <Rocket className="w-5 h-5" />
                </div>
                
                <div className="absolute top-1/2 -right-8 bg-pink-500 text-white p-2 rounded-full shadow-lg">
                  <Star className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Generator Section */}
      <section id="generator-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {getLocalizedText('home.generator.title', '🎨 AI Creative Studio')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getLocalizedText('home.generator.description', 'Choose your creative method, set your style, and let AI create beautiful works for you')}
            </p>
          </div>

          <Suspense fallback={<GeneratorSkeleton />}>
            <ImageGenerator
                texts={{
                uploadTitle: getLocalizedText('generator.uploadTitle', 'Upload Image or Enter Text'),
                uploadDescription: getLocalizedText('generator.uploadDescription', 'Drag and drop an image or enter creative text'),
                uploadPlaceholder: getLocalizedText('generator.uploadPlaceholder', 'Select an image or enter your creative idea'),
                settingsTitle: getLocalizedText('generator.settingsTitle', 'Style Settings'),
                settingsDescription: getLocalizedText('generator.settingsDescription', 'Choose your preferred Sybau style'),
                styleLabel: getLocalizedText('generator.style', 'Style'),
                styleOption: getLocalizedText('generator.styleOption', 'Sybau Style'),
                styleDescription: getLocalizedText('generator.styleDescription', 'Apply Sybau style - Stay Young, Beautiful and Unique'),
                promptLabel: getLocalizedText('generator.promptLabel', 'Creative Prompt'),
                promptPlaceholder: getLocalizedText('generator.promptPlaceholder', 'Enter your creative idea or leave blank for image-based generation'),
                generateButton: getLocalizedText('generator.generateButton', 'Generate'),
                downloadButton: getLocalizedText('generator.downloadButton', 'Download'),
                generating: getLocalizedText('generator.generating', 'Generating...'),
                success: getLocalizedText('generator.success', 'Success!'),
                error: getLocalizedText('generator.error', 'Error occurred'),
                maxFileSize: getLocalizedText('generator.maxFileSize', 'Max 5MB'),
                supportedFormats: getLocalizedText('generator.supportedFormats', 'JPG, PNG, WebP supported'),
                dragAndDrop: getLocalizedText('generator.dragAndDrop', 'Drag and drop'),
                clickToBrowse: getLocalizedText('generator.clickToBrowse', 'Click to browse'),
                intensityLabel: getLocalizedText('generator.intensityLabel', 'Style Intensity'),
                modeLabel: getLocalizedText('generator.modeLabel', 'Mode'),
                classicMode: getLocalizedText('generator.classicMode', 'Classic Sybau'),
                exaggeratedMode: getLocalizedText('generator.exaggeratedMode', 'Expressive Sybau'),
                professionalMode: getLocalizedText('generator.professionalMode', 'Professional Sybau'),
                creativeMode: getLocalizedText('generator.creativeMode', 'Creative Sybau'),
                classicDescription: getLocalizedText('generator.classicDescription', 'Traditional Sybau style with balanced aesthetics'),
                exaggeratedDescription: getLocalizedText('generator.exaggeratedDescription', 'Bold expressions that capture Gen Z energy'),
                professionalDescription: getLocalizedText('generator.professionalDescription', 'Refined Sybau style for professional use'),
                creativeDescription: getLocalizedText('generator.creativeDescription', 'Innovative Sybau style for creative projects'),
                textToImageMode: getLocalizedText('generator.textToImageMode', 'Text Creation'),
                imageToImageMode: getLocalizedText('generator.imageToImageMode', 'Image Creation'),
                textPromptLabel: getLocalizedText('generator.textPromptLabel', 'Text Prompt'),
                textPromptPlaceholder: getLocalizedText('generator.textPromptPlaceholder', 'Describe your image...'),
                detailedPrompt: getLocalizedText('generator.detailedPrompt', 'Describe in detail the image you want to create, including style, colors, mood and details...'),
                detailsHelpAI: getLocalizedText('generator.detailsHelpAI', 'Detailed descriptions help AI generate better works'),
                optionalStyleChange: getLocalizedText('generator.optionalStyleChange', 'Optional: describe desired style changes...'),
                dragImageHere: getLocalizedText('generator.dragImageHere', 'Drag image here'),
                orClickToSelect: getLocalizedText('generator.orClickToSelect', 'or click to select file'),
                supportedFormatsShort: getLocalizedText('generator.supportedFormatsShort', 'Support JPG, PNG, WebP • Max 5MB'),
                loginToStart: getLocalizedText('generator.loginToStart', '🚀 Login to Start Creating'),
                startCreating: getLocalizedText('generator.startCreating', '🚀 Start AI Creation'),
                creationInProgress: getLocalizedText('generator.creationInProgress', 'AI is creating...'),
                creationWait: getLocalizedText('generator.creationWait', 'Please wait while AI creates your image...'),
                creationResult: getLocalizedText('generator.creationResult', '✨ Creation Result'),
                creationResultDesc: getLocalizedText('generator.creationResultDesc', 'Your AI creation will be beautifully presented here'),
                creationComplete: getLocalizedText('generator.creationComplete', 'Creation Complete!'),
                creationReady: getLocalizedText('generator.creationReady', 'Ready to Create'),
                creationWaiting: getLocalizedText('generator.creationWaiting', 'Waiting for your creation command...'),
                downloadImage: getLocalizedText('generator.downloadImage', 'Download Image'),
                recreate: getLocalizedText('generator.recreate', 'Create Again'),
                creationPreparation: getLocalizedText('generator.creationPreparation', '🎨 Creation Preparation'),
                creationPreparationDesc: getLocalizedText('generator.creationPreparationDesc', 'Choose your creative method, set your style, and let AI create beautiful works for you'),
                creationMode: getLocalizedText('generator.creationMode', 'Creation Mode'),
                // 新增的文本键
                textToImage: getLocalizedText('generator.textToImage', 'Text-to-Image'),
                smartRetouch: getLocalizedText('generator.smartRetouch', 'Smart Retouch'),
                hdEnhance: getLocalizedText('generator.hdEnhance', 'HD Enhance'),
                imageEdit: getLocalizedText('generator.imageEdit', 'Image Edit'),
                textMode: getLocalizedText('generator.textMode', 'Text'),
                imageMode: getLocalizedText('generator.imageMode', 'Image'),
                dragImagePlaceholder: getLocalizedText('generator.dragImagePlaceholder', 'Drag image here'),
                selectFile: getLocalizedText('generator.selectFile', 'or click to select file'),
                styleOptional: getLocalizedText('generator.styleOptional', 'Optional: describe desired style changes...'),
                style: getLocalizedText('generator.style', 'Style'),
                intensity: getLocalizedText('generator.intensity', 'Intensity'),
                generate: getLocalizedText('generator.generate', 'Generate'),
                templateLibrary: getLocalizedText('generator.templateLibrary', 'Template Library'),
                templatesCount: getLocalizedText('generator.templatesCount', 'Templates'),
                needUpgrade: getLocalizedText('generator.needUpgrade', 'Upgrade Required'),
                upgradeNow: getLocalizedText('generator.upgradeNow', 'Upgrade Now'),
                result: getLocalizedText('generator.result', 'Generation Result'),
                random: getLocalizedText('generator.random', 'Random')
              }}
            />
          </Suspense>
        </div>
      </section>

      {/* FLUX Engine Features Section - Lazy Loaded */}
      <LazyFluxEngineSection currentLang={currentLang} />


      {/* Unified Scenario Showcase - SnapEdit Style */}
      <Suspense fallback={<ShowcaseSkeleton />}>
        <UnifiedScenarioShowcase currentLang={currentLang} />
      </Suspense>



      {/* Technical Comparison Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {getLocalizedText('home.comparison.title', '⚡ Why Choose FLUX Engine?')}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-gray-200">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{getLocalizedText('home.comparison.traditional', 'Traditional Photo Editing')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">{getLocalizedText('home.comparison.skill.traditional', 'Requires professional skills')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">{getLocalizedText('home.comparison.time.traditional', 'Takes hours')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">{getLocalizedText('home.comparison.effect.traditional', 'Stiff results')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">{getLocalizedText('home.comparison.function.traditional', 'Single function')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-gradient-to-br from-purple-50 to-cyan-50">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{getLocalizedText('home.comparison.flux', 'FLUX Engine')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">{getLocalizedText('home.comparison.skill.flux', 'Zero-skill startup')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">{getLocalizedText('home.comparison.time.flux', '15 seconds completion')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">{getLocalizedText('home.comparison.effect.flux', 'AI-intelligent natural')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">{getLocalizedText('home.comparison.function.flux', '9 scenarios full coverage')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {getLocalizedText('home.howitworks.title', 'How Sybau Picture Works')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getLocalizedText('home.howitworks.description', 'Creating viral creative content with Sybau Picture is simple, fast, and completely free. Our AI-powered platform transforms your ideas into engaging visuals in three easy steps.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: getLocalizedText('home.howitworks.step1', 'Upload or Enter Text'),
                description: getLocalizedText('home.howitworks.step1.desc', 'Simply upload an image or enter text description. Sybau Picture supports JPG, PNG, WebP formats and creative text prompts.'),
                icon: <Users className="w-8 h-8" />
              },
              {
                step: '2',
                title: getLocalizedText('home.howitworks.step2', 'AI Processing Magic'),
                description: getLocalizedText('home.howitworks.step2.desc', 'Our advanced AI technology analyzes your input and applies the signature Sybau style transformation automatically.'),
                icon: <Sparkles className="w-8 h-8" />
              },
              {
                step: '3',
                title: getLocalizedText('home.howitworks.step3', 'Download Your Creation'),
                description: getLocalizedText('home.howitworks.step3.desc', 'Within seconds, download your high-quality Sybau Picture creation ready to share across all social platforms.'),
                icon: <Award className="w-8 h-8" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-16 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 transform -translate-x-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {getLocalizedText('home.features.title', 'Why Choose Sybau Picture?')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {getLocalizedText('home.features.description', 'Experience the power of AI-driven creative content generation with Sybau Picture, embracing the Gen Z culture of Stay Young, Beautiful and Unique.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: getLocalizedText('home.features.aiPowered.title', 'AI-Powered Technology'),
                description: getLocalizedText('home.features.aiPowered.description', 'Advanced artificial intelligence ensures every Sybau Picture creation is perfect and engaging.'),
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: <Rocket className="w-8 h-8" />,
                title: getLocalizedText('home.features.lightning.title', 'Lightning Fast Processing'),
                description: getLocalizedText('home.features.lightning.description', 'Generate professional-quality creations in just 8 seconds with Sybau Picture\'s optimized system.'),
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: getLocalizedText('home.features.easy.title', 'Easy to Use Interface'),
                description: getLocalizedText('home.features.easy.description', 'No design experience needed - Sybau Picture makes creative content accessible to everyone.'),
                color: 'from-pink-500 to-red-500'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: getLocalizedText('home.features.secure.title', 'Secure & Private'),
                description: getLocalizedText('home.features.secure.desc', 'Your images and text are processed securely and never stored on our servers. Sybau Picture respects your privacy.'),
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: getLocalizedText('home.features.community.title', 'Global Community'),
                description: getLocalizedText('home.features.community.desc', 'Join millions of creators worldwide who embrace the Sybau lifestyle - Stay Young, Beautiful and Unique.'),
                color: 'from-blue-500 to-indigo-500'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: getLocalizedText('home.features.available.title', '24/7 Available'),
                description: getLocalizedText('home.features.available.desc', 'Create content anytime, anywhere with Sybau Picture. Our platform is always ready when inspiration strikes.'),
                color: 'from-cyan-500 to-teal-500'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {getLocalizedText('home.usecases.title', 'Perfect for Every Creator')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {getLocalizedText('home.usecases.description', 'Whether you\'re a professional marketer or creative enthusiast, Sybau Picture empowers everyone to create viral content that captures the essence of Gen Z culture.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              {
                title: getLocalizedText('home.usecases.social', 'Social Media Influencers'),
                description: getLocalizedText('home.usecases.social.desc', 'Create engaging content that resonates with Gen Z audiences and embodies the Sybau spirit.'),
                icon: <TrendingUp className="w-6 h-6" />
              },
              {
                title: getLocalizedText('home.usecases.content', 'Content Creators'),
                description: getLocalizedText('home.usecases.content.desc', 'Stand out on platforms like TikTok, Instagram, and YouTube with unique Sybau Picture creations.'),
                icon: <Star className="w-6 h-6" />
              },
              {
                title: getLocalizedText('home.usecases.marketing', 'Marketing Teams'),
                description: getLocalizedText('home.usecases.marketing.desc', 'Connect with younger audiences through authentic content that speaks their language.'),
                icon: <Award className="w-6 h-6" />
              },
              {
                title: getLocalizedText('home.usecases.individuals', 'Individual Users'),
                description: getLocalizedText('home.usecases.individuals.desc', 'Express your creativity and stay true to the Sybau values of being young, beautiful, and unique.'),
                icon: <Heart className="w-6 h-6" />
              }
            ].map((usecase, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mr-3">
                    {usecase.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{usecase.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{usecase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {getLocalizedText('home.community.title', 'Join the Sybau Picture Community')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {getLocalizedText('home.community.extended', 'Share your creations, get inspired, and discover new ways to express your unique style.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">{getLocalizedText('home.community.stats.users', '1.2M+')}</div>
              <div className="text-gray-600">{getLocalizedText('home.community.stats.users.label', 'Active Users')}</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl">
              <div className="text-3xl font-bold text-pink-600 mb-2">{getLocalizedText('home.community.stats.creations', '50K+')}</div>
              <div className="text-gray-600">{getLocalizedText('home.community.stats.creations.label', 'Daily Creations')}</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl">
              <div className="text-3xl font-bold text-cyan-600 mb-2">{getLocalizedText('home.community.stats.satisfaction', '95%')}</div>
              <div className="text-gray-600">{getLocalizedText('home.community.stats.satisfaction.label', 'Satisfaction Rate')}</div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer Features */}
      <section className="py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-8 text-center text-white/80 mb-8">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>{getLocalizedText('home.footer.secure', 'Secure Processing')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{getLocalizedText('home.footer.speed', '8-Second Generation')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{getLocalizedText('home.footer.community', 'Global Community')}</span>
              </div>
            </div>

            <p className="text-sm text-white/60">
              {getLocalizedText('home.footer.features', 'Sybau Picture supports JPG, PNG, WebP formats and text prompts • Google Login • 100% secure')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
