'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Rocket, Star, TrendingUp, Heart, Users, Shield, Clock, Award, Check, Play } from 'lucide-react'
import ImageGenerator from '@/components/ImageGenerator'
import { useSession, getSession } from 'next-auth/react'

// 静态文本内容
const staticTexts = {
  en: {
    'home.hero.title': 'Create Viral',
    'home.hero.subtitle': 'Sybau Creations',
    'home.hero.tagline': 'in Seconds',
    'home.hero.description': 'Transform any text or image into stunning creative visuals with our AI technology! Experience the Sybau culture - Stay Young, Beautiful and Unique!',
    'home.benefits.free': '100% Free',
    'home.benefits.noRegistration': 'Google Login',
    'home.benefits.hdQuality': 'HD Quality',
    'home.benefits.fastProcessing': '8s Processing',
    'home.socialProof': 'Trusted by creators worldwide',
    'home.stats.memes': 'Creations Made',
    'home.stats.rating': 'User Rating',
    'home.stats.countries': 'Countries',
    'home.generator.title': '🎨 AI Creative Studio',
    'home.generator.description': 'Choose your creative method, set your style, and let AI create beautiful works for you',
    'home.howitworks.title': 'How Sybau Picture Works',
    'home.howitworks.description': 'Creating viral creative content with Sybau Picture is simple, fast, and completely free. Our AI-powered platform transforms your ideas into engaging visuals in three easy steps.',
    'home.howitworks.step1': 'Upload or Enter Text',
    'home.howitworks.step1.desc': 'Simply upload an image or enter text description. Sybau Picture supports JPG, PNG, WebP formats and creative text prompts.',
    'home.howitworks.step2': 'AI Processing Magic',
    'home.howitworks.step2.desc': 'Our advanced AI technology analyzes your input and applies the signature Sybau style transformation automatically.',
    'home.howitworks.step3': 'Download Your Creation',
    'home.howitworks.step3.desc': 'Within seconds, download your high-quality Sybau Picture creation ready to share across all social platforms.',
    'home.features.title': 'Why Choose Sybau Picture?',
    'home.features.description': 'Experience the power of AI-driven creative content generation with Sybau Picture, embracing the Gen Z culture of Stay Young, Beautiful and Unique.',
    'home.features.aiPowered.title': 'AI-Powered Technology',
    'home.features.aiPowered.description': 'Advanced artificial intelligence ensures every Sybau Picture creation is perfect and engaging.',
    'home.features.lightning.title': 'Lightning Fast Processing',
    'home.features.lightning.description': 'Generate professional-quality creations in just 8 seconds with Sybau Picture\'s optimized system.',
    'home.features.easy.title': 'Easy to Use Interface',
    'home.features.easy.description': 'No design experience needed - Sybau Picture makes creative content accessible to everyone.',
    'home.features.secure.title': 'Secure & Private',
    'home.features.secure.desc': 'Your images and text are processed securely and never stored on our servers. Sybau Picture respects your privacy.',
    'home.features.community.title': 'Global Community',
    'home.features.community.desc': 'Join millions of creators worldwide who embrace the Sybau lifestyle - Stay Young, Beautiful and Unique.',
    'home.features.available.title': '24/7 Available',
    'home.features.available.desc': 'Create content anytime, anywhere with Sybau Picture. Our platform is always ready when inspiration strikes.',
    'home.usecases.title': 'Perfect for Every Creator',
    'home.usecases.description': 'Whether you\'re a professional marketer or creative enthusiast, Sybau Picture empowers everyone to create viral content that captures the essence of Gen Z culture.',
    'home.usecases.social': 'Social Media Influencers',
    'home.usecases.social.desc': 'Create engaging content that resonates with Gen Z audiences and embodies the Sybau spirit.',
    'home.usecases.content': 'Content Creators',
    'home.usecases.content.desc': 'Stand out on platforms like TikTok, Instagram, and YouTube with unique Sybau Picture creations.',
    'home.usecases.marketing': 'Marketing Teams',
    'home.usecases.marketing.desc': 'Connect with younger audiences through authentic content that speaks their language.',
    'home.usecases.individuals': 'Individual Users',
    'home.usecases.individuals.desc': 'Express your creativity and stay true to the Sybau values of being young, beautiful, and unique.',
    'home.community.title': 'Join the Sybau Picture Community',
    'home.community.extended': 'Share your creations, get inspired, and discover new ways to express your unique style.',
    'home.community.stats.users': '1.2M+',
    'home.community.stats.users.label': 'Active Users',
    'home.community.stats.creations': '50K+',
    'home.community.stats.creations.label': 'Daily Creations',
    'home.community.stats.satisfaction': '95%',
    'home.community.stats.satisfaction.label': 'Satisfaction Rate',
    'home.pricing.title': 'Choose Your Plan',
    'home.pricing.description': 'Start creating amazing Sybau content today. Choose the plan that fits your needs.',
    'home.pricing.free.title': 'Free',
    'home.pricing.free.price': '$0',
    'home.pricing.free.period': 'forever',
    'home.pricing.free.description': 'Perfect for getting started',
    'home.pricing.free.feature1': 'Free creative experience',
    'home.pricing.free.feature2': 'Basic Sybau styles',
    'home.pricing.free.feature3': 'Standard quality',
    'home.pricing.pro.title': 'Standard',
    'home.pricing.pro.price': '$9',
    'home.pricing.pro.period': 'per month',
    'home.pricing.pro.description': 'Best for regular creators',
    'home.pricing.pro.feature1': '60 generations per month',
    'home.pricing.pro.feature2': 'All Sybau styles',
    'home.pricing.pro.feature3': 'High quality, no watermarks',
    'home.pricing.enterprise.title': 'Professional',
    'home.pricing.enterprise.price': '$19',
    'home.pricing.enterprise.period': 'per month',
    'home.pricing.enterprise.description': 'For businesses and power users',
    'home.pricing.enterprise.feature1': '180 generations per month',
    'home.pricing.enterprise.feature2': 'Exclusive styles + priority support',
    'home.pricing.enterprise.feature3': 'Ultra high quality + commercial license',
    'home.pricing.viewAllPlans': 'View All Plans',
    'home.pricing.popular': 'Most Popular',
    'home.cta.title': 'Ready to Go Viral? 🚀',
    'home.cta.description': 'Join millions of creators who are already embracing the Sybau lifestyle. Stay Young, Beautiful and Unique with our AI-powered creative platform!',
    'home.cta.startCreating': 'Start Creating Now',
    'home.cta.getStarted': 'Get Started',
    'home.cta.signUp': 'Sign In Now',
    'home.cta.choosePlan': 'Choose Plan',
    'home.footer.features': 'Sybau Picture supports JPG, PNG, WebP formats and text prompts • Google Login • 100% secure',
    'home.footer.secure': 'Secure Processing',
    'home.footer.speed': '8-Second Generation',
    'home.footer.community': 'Global Community',
    'footer.description': 'The world\'s first AI creative platform inspired by Gen Z culture. Stay Young, Beautiful and Unique with Sybau Picture.',
    // Generator specific texts
    'generator.uploadTitle': 'Upload Image or Enter Text',
    'generator.uploadDescription': 'Drag and drop an image or enter creative text',
    'generator.uploadPlaceholder': 'Select an image or enter your creative idea',
    'generator.settingsTitle': 'Style Settings',
    'generator.settingsDescription': 'Choose your preferred Sybau style',
    'generator.styleLabel': 'Sybau Style',
    'generator.styleOption': 'Sybau Style',
    'generator.styleDescription': 'Apply Sybau style - Stay Young, Beautiful and Unique',
    'generator.promptLabel': 'Creative Prompt',
    'generator.promptPlaceholder': 'Enter your creative idea or leave blank for image-based generation',
    'generator.generateButton': 'Generate Creation',
    'generator.downloadButton': 'Download',
    'generator.generating': 'Generating...',
    'generator.success': 'Generated successfully!',
    'generator.error': 'Generation failed',
    'generator.maxFileSize': 'Max file size: 5MB',
    'generator.supportedFormats': 'Supported formats: JPG, PNG, WebP or text prompts',
    'generator.dragAndDrop': 'Drag and drop your image here or enter creative text',
    'generator.clickToBrowse': 'or click to browse',
    'generator.intensityLabel': 'Intensity',
    'generator.modeLabel': 'Mode',
    'generator.classicMode': 'Classic',
    'generator.exaggeratedMode': 'Expressive',
    'generator.professionalMode': 'Professional',
    'generator.creativeMode': 'Creative',
    'generator.classicDescription': 'Traditional Sybau style with balanced aesthetics',
    'generator.exaggeratedDescription': 'Bold expressions that capture Gen Z energy',
    'generator.professionalDescription': 'Refined Sybau style for professional use',
    'generator.creativeDescription': 'Artistic interpretation with unique creativity',
    'generator.textToImageMode': 'Text to Image',
    'generator.imageToImageMode': 'Image to Image',
    'generator.textPromptLabel': 'Text Prompt',
    'generator.textPromptPlaceholder': 'Describe what you want to create...',
    'generator.creationReady': 'Ready to Create',
    'generator.creationResult': '✨ Creation Result',
    'generator.creationResultDesc': 'Your AI creation will be beautifully presented here',
    'generator.creationInProgress': 'AI is creating...',
    'generator.creationWait': 'Please wait, estimated 15-30 seconds',
    'generator.creationComplete': '🎉 Creation complete! You can download the image or create again',
    'generator.creationWaiting': 'Waiting for your creation command...',
    'generator.downloadImage': 'Download Image',
    'generator.recreate': 'Create Again',
    'generator.loginToStart': '🚀 Login to Start Creating',
    'generator.startCreating': '🚀 Start AI Creation',
    'generator.dragImageHere': 'Drag image here',
    'generator.orClickToSelect': 'or click to select file',
    'generator.supportedFormatsShort': 'Support JPG, PNG, WebP • Max 5MB',
    'generator.optionalStyleChange': 'Optional: describe desired style changes...',
    'generator.detailsHelpAI': 'Detailed descriptions help AI generate better works',
    'generator.detailedPrompt': 'Describe in detail the image you want to create, including style, colors, mood and details...'
  },
  zh: {
    'home.hero.title': '创建病毒式',
    'home.hero.subtitle': 'Sybau创作',
    'home.hero.tagline': '几秒钟搞定',
    'home.hero.description': '使用我们的AI技术将任何文本或图片转换为令人惊艳的创意视觉作品！体验Sybau文化 - Stay Young, Beautiful and Unique！',
    'home.benefits.free': '100%免费',
    'home.benefits.noRegistration': '谷歌登录',
    'home.benefits.hdQuality': '高清质量',
    'home.benefits.fastProcessing': '8秒处理',
    'home.socialProof': '全球创作者信赖',
    'home.stats.memes': '创作已生成',
    'home.stats.rating': '用户评分',
    'home.stats.countries': '个国家',
    'home.generator.title': '🎨 AI创意工作室',
    'home.generator.description': '选择您的创作方式，设定您的风格，让AI为您创造美丽作品',
    'home.howitworks.title': 'Sybau Picture如何工作',
    'home.howitworks.description': '使用Sybau Picture创建病毒式创意内容简单、快速且完全免费。我们的AI驱动平台通过三个简单步骤将您的想法转换为引人入胜的视觉作品。',
    'home.howitworks.step1': '上传图片或输入文本',
    'home.howitworks.step1.desc': '只需上传图片或输入文字描述。Sybau Picture支持JPG、PNG、WebP格式和创意文本提示。',
    'home.howitworks.step2': 'AI处理魔法',
    'home.howitworks.step2.desc': '我们先进的AI技术分析您的输入并自动应用标志性的Sybau风格转换。',
    'home.howitworks.step3': '下载您的创作',
    'home.howitworks.step3.desc': '几秒钟内，下载您的高质量Sybau Picture创作，准备在所有社交平台上分享。',
    'home.features.title': '为什么选择Sybau Picture？',
    'home.features.description': '体验AI驱动的创意内容生成的力量，Sybau Picture拥抱Z时代文化 - Stay Young, Beautiful and Unique。',
    'home.features.aiPowered.title': 'AI驱动技术',
    'home.features.aiPowered.description': '先进的人工智能确保每个Sybau Picture作品都完美且引人入胜。',
    'home.features.lightning.title': '闪电般快速处理',
    'home.features.lightning.description': '使用Sybau Picture的优化系统，仅需8秒生成专业质量的创作。',
    'home.features.easy.title': '简单易用界面',
    'home.features.easy.description': '无需设计经验 - Sybau Picture让创意内容创作对所有人都触手可及。',
    'home.features.secure.title': '安全私密',
    'home.features.secure.desc': '您的图像和文本被安全处理，永远不会存储在我们的服务器上。Sybau Picture尊重您的隐私。',
    'home.features.community.title': '全球社区',
    'home.features.community.desc': '加入全球数百万拥抱Sybau生活方式的创作者 - Stay Young, Beautiful and Unique。',
    'home.features.available.title': '24/7可用',
    'home.features.available.desc': '随时随地使用Sybau Picture创建内容。当灵感来袭时，我们的平台始终准备就绪。',
    'home.usecases.title': '适合每个创作者',
    'home.usecases.description': '无论您是专业营销人员还是创意爱好者，Sybau Picture都能让每个人创建捕捉Z时代文化精髓的病毒式内容。',
    'home.usecases.social': '社交媒体影响者',
    'home.usecases.social.desc': '创建与Z时代观众产生共鸣并体现Sybau精神的引人入胜内容。',
    'home.usecases.content': '内容创作者',
    'home.usecases.content.desc': '在TikTok、Instagram和YouTube等平台上通过独特的Sybau Picture创作脱颖而出。',
    'home.usecases.marketing': '营销团队',
    'home.usecases.marketing.desc': '通过说年轻人语言的真实内容与年轻受众建立联系。',
    'home.usecases.individuals': '个人用户',
    'home.usecases.individuals.desc': '表达您的创造力，忠于Sybau价值观 - 年轻、美丽、独特。',
    'home.community.title': '加入Sybau Picture社区',
    'home.community.extended': '分享您的创作，获得灵感，发现表达独特风格的新方式。',
    'home.community.stats.users': '120万+',
    'home.community.stats.users.label': '活跃用户',
    'home.community.stats.creations': '5万+',
    'home.community.stats.creations.label': '每日创作',
    'home.community.stats.satisfaction': '95%',
    'home.community.stats.satisfaction.label': '满意度',
    'home.pricing.title': '选择您的套餐',
    'home.pricing.description': '今天就开始创建令人惊叹的Sybau内容。选择适合您需求的套餐。',
    'home.pricing.free.title': '免费版',
    'home.pricing.free.price': '$0',
    'home.pricing.free.period': '永久',
    'home.pricing.free.description': '完美的入门体验',
    'home.pricing.free.feature1': '免费创作体验',
    'home.pricing.free.feature2': '基础Sybau风格',
    'home.pricing.free.feature3': '标准质量',
    'home.pricing.pro.title': '标准版',
    'home.pricing.pro.price': '$9',
    'home.pricing.pro.period': '每月',
    'home.pricing.pro.description': '最适合常规创作者',
    'home.pricing.pro.feature1': '每月60次生成',
    'home.pricing.pro.feature2': '所有Sybau风格',
    'home.pricing.pro.feature3': '高质量，无水印',
    'home.pricing.enterprise.title': '专业版',
    'home.pricing.enterprise.price': '$19',
    'home.pricing.enterprise.period': '每月',
    'home.pricing.enterprise.description': '适合企业和专业用户',
    'home.pricing.enterprise.feature1': '每月180次生成',
    'home.pricing.enterprise.feature2': '独家风格 + 优先支持',
    'home.pricing.enterprise.feature3': '超高质量 + 商业许可证',
    'home.pricing.viewAllPlans': '查看所有套餐',
    'home.pricing.popular': '最受欢迎',
    'home.cta.title': '准备好病毒式传播了吗？🚀',
    'home.cta.description': '加入已经拥抱Sybau生活方式的数百万创作者。通过我们的AI驱动创意平台 Stay Young, Beautiful and Unique！',
    'home.cta.startCreating': '立即开始创作',
    'home.cta.getStarted': '开始使用',
    'home.cta.signUp': '立即注册',
    'home.cta.choosePlan': '选择套餐',
    'home.footer.features': 'Sybau Picture支持JPG、PNG、WebP格式和文本提示 • 谷歌登录 • 100%安全',
    'home.footer.secure': '安全处理',
    'home.footer.speed': '8秒生成',
    'home.footer.community': '全球社区',
    'footer.description': '世界首个受Z时代文化启发的AI创意平台。使用Sybau Picture Stay Young, Beautiful and Unique。',
    // Generator specific texts
    'generator.uploadTitle': '上传图片或输入文本',
    'generator.uploadDescription': '拖拽图片或输入创意文本',
    'generator.uploadPlaceholder': '选择图片或输入您的创意想法',
    'generator.settingsTitle': '风格设置',
    'generator.settingsDescription': '选择您喜欢的Sybau风格',
    'generator.styleLabel': 'Sybau 风格',
    'generator.styleOption': 'Sybau风格',
    'generator.styleDescription': '应用Sybau风格 - Stay Young, Beautiful and Unique',
    'generator.promptLabel': '创意提示',
    'generator.promptPlaceholder': '输入您的创意想法或留空进行基于图像的生成',
    'generator.generateButton': '生成创作',
    'generator.downloadButton': '下载',
    'generator.generating': '生成中...',
    'generator.success': '生成成功！',
    'generator.error': '生成失败',
    'generator.maxFileSize': '最大文件大小：5MB',
    'generator.supportedFormats': '支持格式：JPG、PNG、WebP或文本提示',
    'generator.dragAndDrop': '拖拽图片到这里或输入创意文本',
    'generator.clickToBrowse': '或点击浏览',
    'generator.intensityLabel': '强度',
    'generator.modeLabel': '模式',
    'generator.classicMode': '经典',
    'generator.exaggeratedMode': '表现力',
    'generator.professionalMode': '专业',
    'generator.creativeMode': '创意',
    'generator.classicDescription': '传统Sybau风格，平衡美学',
    'generator.exaggeratedDescription': '捕捉Z时代活力的大胆表现',
    'generator.professionalDescription': '专业使用的精致Sybau风格',
    'generator.creativeDescription': '独特创意的艺术诠释',
    'generator.textToImageMode': '文字转图片',
    'generator.imageToImageMode': '图片转图片',
    'generator.textPromptLabel': '文字提示',
    'generator.textPromptPlaceholder': '描述您想要创建的内容...',
    'generator.creationReady': '准备创作',
    'generator.creationResult': '✨ 创作结果',
    'generator.creationResultDesc': '您的AI创作将在这里精彩呈现',
    'generator.creationInProgress': 'AI正在创作中...',
    'generator.creationWait': '请稍候，预计需要15-30秒',
    'generator.creationComplete': '🎉 创作完成！您可以下载图片或重新创作',
    'generator.creationWaiting': '等待您的创作指令...',
    'generator.downloadImage': '下载图片',
    'generator.recreate': '重新创作',
    'generator.loginToStart': '🚀 立即登录开始创作',
    'generator.startCreating': '🚀 开始AI创作',
    'generator.dragImageHere': '拖拽图片到这里',
    'generator.orClickToSelect': '或点击选择文件',
    'generator.supportedFormatsShort': '支持 JPG, PNG, WebP • 最大 5MB',
    'generator.optionalStyleChange': '可选：描述想要的风格变化...',
    'generator.detailsHelpAI': '详细的描述能帮助AI生成更好的作品',
    'generator.detailedPrompt': '详细描述您想要创作的图片，包含风格、颜色、情绪和细节...',
    'generator.creationPreparation': '🎨 创作准备',
    'generator.creationPreparationDesc': '选择您的创作方式，设定您的风格，让AI为您创造美丽作品',
    'generator.creationMode': '创作模式'
  }
}

export default function HomePageClient() {
  const pathname = usePathname()
  const router = useRouter()
  const [stats, setStats] = useState({ memes: 125000, rating: 4.9, countries: 180 })
  const { data: session, status } = useSession()
  
  // 🚨 修复：添加状态检查，确保首页不会重定向
  useEffect(() => {
    // 如果用户直接访问首页，不需要任何重定向
    if (pathname === '/' || pathname === '/zh') {
      console.log('🏠 用户访问首页，保持页面状态')
      return
    }
  }, [pathname])
  
  // 🚨 修复：完全移除复杂的用户数据同步逻辑
  // 现在只依赖于session状态，避免无限循环和状态冲突

  const handlePlanClick = (planType: 'free' | 'standard' | 'professional') => {
    const currentLang = getCurrentLanguage()

    if (planType === 'free') {
      // 免费版直接开始使用
      return
    } else {
      // 付费版跳转到对应语言的定价页面
      const pricingPath = currentLang === 'zh' ? '/zh/pricing' : '/pricing'
      router.push(pricingPath)
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

  const getText = (key: string, fallback: string) => {
    return (staticTexts as any)[currentLang]?.[key] || (staticTexts.en as any)[key] || fallback
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-300/10 to-cyan-400/10"></div>

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-5xl mx-auto">
            {/* Animated Icon */}
            <div className="mb-8">
              <div className="text-6xl mb-4">🎭</div>
              <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Meme Generator
              </Badge>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent leading-tight">
              {getText('home.hero.title', 'Create Viral')} <span className="text-gray-800">{getText('home.hero.subtitle', 'Sybau Creations')}</span><br />
              <span className="text-4xl lg:text-5xl">{getText('home.hero.tagline', 'in Seconds')}</span>
            </h1>

            {/* Description */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              {getText('home.hero.description', 'Transform any text or image into stunning creative visuals with our AI technology! Experience the Sybau culture - Stay Young, Beautiful and Unique!')}
            </p>

            {/* Benefits Row */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { icon: <Star className="w-5 h-5" />, text: getText('home.benefits.free', '100% Free') },
                { icon: <Rocket className="w-5 h-5" />, text: getText('home.benefits.noRegistration', 'Google Login') },
                { icon: <Heart className="w-5 h-5" />, text: getText('home.benefits.hdQuality', 'HD Quality') },
                { icon: <TrendingUp className="w-5 h-5" />, text: getText('home.benefits.fastProcessing', '8s Processing') }
              ].map((benefit, index) => (
                <Badge key={index} variant="outline" className="bg-white/80 backdrop-blur-sm border-purple-200 text-purple-700 px-4 py-2 text-sm font-medium">
                  {benefit.icon}
                  <span className="ml-2">{benefit.text}</span>
                </Badge>
              ))}
            </div>

            {/* Social Proof */}
            <div className="text-center mb-12">
              <p className="text-gray-500 mb-6">{getText('home.socialProof', 'Trusted by creators worldwide')}</p>
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.memes.toLocaleString()}+</div>
                  <div className="text-sm text-gray-500">{getText('home.stats.memes', 'Creations Made')}</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-pink-600 flex items-center">
                    {stats.rating.toFixed(1)}
                    <Star className="w-6 h-6 ml-1 fill-current" />
                  </div>
                  <div className="text-sm text-gray-500">{getText('home.stats.rating', 'User Rating')}</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-cyan-600">{stats.countries}+</div>
                  <div className="text-sm text-gray-500">{getText('home.stats.countries', 'Countries')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {getText('home.generator.title', '🎨 AI Creative Studio')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getText('home.generator.description', 'Choose your creative method, set your style, and let AI create beautiful works for you')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ImageGenerator
              texts={{
                uploadTitle: getText('generator.uploadTitle', 'Upload Image or Enter Text'),
                uploadDescription: getText('generator.uploadDescription', 'Drag and drop an image or enter creative text'),
                uploadPlaceholder: getText('generator.uploadPlaceholder', 'Select an image or enter your creative idea'),
                settingsTitle: getText('generator.settingsTitle', 'Style Settings'),
                settingsDescription: getText('generator.settingsDescription', 'Choose your preferred Sybau style'),
                styleLabel: getText('generator.styleLabel', 'Sybau Style'),
                styleOption: getText('generator.styleOption', 'Sybau Style'),
                styleDescription: getText('generator.styleDescription', 'Apply Sybau style - Stay Young, Beautiful and Unique'),
                promptLabel: getText('generator.promptLabel', 'Creative Prompt'),
                promptPlaceholder: getText('generator.promptPlaceholder', 'Enter your creative idea or leave blank for image-based generation'),
                generateButton: getText('generator.generateButton', 'Generate'),
                downloadButton: getText('generator.downloadButton', 'Download'),
                generating: getText('generator.generating', 'Generating...'),
                success: getText('generator.success', 'Success!'),
                error: getText('generator.error', 'Error occurred'),
                maxFileSize: getText('generator.maxFileSize', 'Max 5MB'),
                supportedFormats: getText('generator.supportedFormats', 'JPG, PNG, WebP supported'),
                dragAndDrop: getText('generator.dragAndDrop', 'Drag and drop'),
                clickToBrowse: getText('generator.clickToBrowse', 'Click to browse'),
                intensityLabel: getText('generator.intensityLabel', 'Style Intensity'),
                modeLabel: getText('generator.modeLabel', 'Generation Mode'),
                classicMode: getText('generator.classicMode', 'Classic Sybau'),
                exaggeratedMode: getText('generator.exaggeratedMode', 'Expressive Sybau'),
                professionalMode: getText('generator.professionalMode', 'Professional Sybau'),
                creativeMode: getText('generator.creativeMode', 'Creative Sybau'),
                classicDescription: getText('generator.classicDescription', 'Traditional Sybau style with balanced aesthetics'),
                exaggeratedDescription: getText('generator.exaggeratedDescription', 'Bold expressions that capture Gen Z energy'),
                professionalDescription: getText('generator.professionalDescription', 'Refined Sybau style for professional use'),
                creativeDescription: getText('generator.creativeDescription', 'Innovative Sybau style for creative projects'),
                textToImageMode: getText('generator.textToImageMode', 'Text Creation'),
                imageToImageMode: getText('generator.imageToImageMode', 'Image Creation'),
                textPromptLabel: getText('generator.textPromptLabel', 'Text Prompt'),
                textPromptPlaceholder: getText('generator.textPromptPlaceholder', 'Describe your image...'),
                detailedPrompt: getText('generator.detailedPrompt', 'Describe in detail the image you want to create, including style, colors, mood and details...'),
                detailsHelpAI: getText('generator.detailsHelpAI', 'Detailed descriptions help AI generate better works'),
                optionalStyleChange: getText('generator.optionalStyleChange', 'Optional: describe desired style changes...'),
                dragImageHere: getText('generator.dragImageHere', 'Drag image here'),
                orClickToSelect: getText('generator.orClickToSelect', 'or click to select file'),
                supportedFormatsShort: getText('generator.supportedFormatsShort', 'Support JPG, PNG, WebP • Max 5MB'),
                loginToStart: getText('generator.loginToStart', '🚀 Login to Start Creating'),
                startCreating: getText('generator.startCreating', '🚀 Start AI Creation'),
                creationInProgress: getText('generator.creationInProgress', 'AI is creating...'),
                creationWait: getText('generator.creationWait', 'Please wait while AI creates your image...'),
                creationResult: getText('generator.creationResult', '✨ Creation Result'),
                creationResultDesc: getText('generator.creationResultDesc', 'Your AI creation will be beautifully presented here'),
                creationComplete: getText('generator.creationComplete', 'Creation Complete!'),
                creationReady: getText('generator.creationReady', 'Ready to Create'),
                creationWaiting: getText('generator.creationWaiting', 'Waiting for your creation command...'),
                downloadImage: getText('generator.downloadImage', 'Download Image'),
                recreate: getText('generator.recreate', 'Create Again'),
                creationPreparation: getText('generator.creationPreparation', '🎨 Creation Preparation'),
                creationPreparationDesc: getText('generator.creationPreparationDesc', 'Choose your creative method, set your style, and let AI create beautiful works for you'),
                creationMode: getText('generator.creationMode', 'Creation Mode')
              }}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {getText('home.howitworks.title', 'How Sybau Picture Works')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getText('home.howitworks.description', 'Creating viral creative content with Sybau Picture is simple, fast, and completely free. Our AI-powered platform transforms your ideas into engaging visuals in three easy steps.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: getText('home.howitworks.step1', 'Upload or Enter Text'),
                description: getText('home.howitworks.step1.desc', 'Simply upload an image or enter text description. Sybau Picture supports JPG, PNG, WebP formats and creative text prompts.'),
                icon: <Users className="w-8 h-8" />
              },
              {
                step: '2',
                title: getText('home.howitworks.step2', 'AI Processing Magic'),
                description: getText('home.howitworks.step2.desc', 'Our advanced AI technology analyzes your input and applies the signature Sybau style transformation automatically.'),
                icon: <Sparkles className="w-8 h-8" />
              },
              {
                step: '3',
                title: getText('home.howitworks.step3', 'Download Your Creation'),
                description: getText('home.howitworks.step3.desc', 'Within seconds, download your high-quality Sybau Picture creation ready to share across all social platforms.'),
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
              {getText('home.features.title', 'Why Choose Sybau Picture?')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {getText('home.features.description', 'Experience the power of AI-driven creative content generation with Sybau Picture, embracing the Gen Z culture of Stay Young, Beautiful and Unique.')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: getText('home.features.aiPowered.title', 'AI-Powered Technology'),
                description: getText('home.features.aiPowered.description', 'Advanced artificial intelligence ensures every Sybau Picture creation is perfect and engaging.'),
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: <Rocket className="w-8 h-8" />,
                title: getText('home.features.lightning.title', 'Lightning Fast Processing'),
                description: getText('home.features.lightning.description', 'Generate professional-quality creations in just 8 seconds with Sybau Picture\'s optimized system.'),
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: getText('home.features.easy.title', 'Easy to Use Interface'),
                description: getText('home.features.easy.description', 'No design experience needed - Sybau Picture makes creative content accessible to everyone.'),
                color: 'from-pink-500 to-red-500'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: getText('home.features.secure.title', 'Secure & Private'),
                description: getText('home.features.secure.desc', 'Your images and text are processed securely and never stored on our servers. Sybau Picture respects your privacy.'),
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: getText('home.features.community.title', 'Global Community'),
                description: getText('home.features.community.desc', 'Join millions of creators worldwide who embrace the Sybau lifestyle - Stay Young, Beautiful and Unique.'),
                color: 'from-blue-500 to-indigo-500'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: getText('home.features.available.title', '24/7 Available'),
                description: getText('home.features.available.desc', 'Create content anytime, anywhere with Sybau Picture. Our platform is always ready when inspiration strikes.'),
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
              {getText('home.usecases.title', 'Perfect for Every Creator')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {getText('home.usecases.description', 'Whether you\'re a professional marketer or creative enthusiast, Sybau Picture empowers everyone to create viral content that captures the essence of Gen Z culture.')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: getText('home.usecases.social', 'Social Media Influencers'),
                description: getText('home.usecases.social.desc', 'Create engaging content that resonates with Gen Z audiences and embodies the Sybau spirit.'),
                icon: <TrendingUp className="w-6 h-6" />
              },
              {
                title: getText('home.usecases.content', 'Content Creators'),
                description: getText('home.usecases.content.desc', 'Stand out on platforms like TikTok, Instagram, and YouTube with unique Sybau Picture creations.'),
                icon: <Star className="w-6 h-6" />
              },
              {
                title: getText('home.usecases.marketing', 'Marketing Teams'),
                description: getText('home.usecases.marketing.desc', 'Connect with younger audiences through authentic content that speaks their language.'),
                icon: <Award className="w-6 h-6" />
              },
              {
                title: getText('home.usecases.individuals', 'Individual Users'),
                description: getText('home.usecases.individuals.desc', 'Express your creativity and stay true to the Sybau values of being young, beautiful, and unique.'),
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
              {getText('home.community.title', 'Join the Sybau Picture Community')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {getText('home.community.extended', 'Share your creations, get inspired, and discover new ways to express your unique style.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">{getText('home.community.stats.users', '1.2M+')}</div>
              <div className="text-gray-600">{getText('home.community.stats.users.label', 'Active Users')}</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl">
              <div className="text-3xl font-bold text-pink-600 mb-2">{getText('home.community.stats.creations', '50K+')}</div>
              <div className="text-gray-600">{getText('home.community.stats.creations.label', 'Daily Creations')}</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl">
              <div className="text-3xl font-bold text-cyan-600 mb-2">{getText('home.community.stats.satisfaction', '95%')}</div>
              <div className="text-gray-600">{getText('home.community.stats.satisfaction.label', 'Satisfaction Rate')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
              {getText('home.pricing.title', 'Choose Your Plan')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getText('home.pricing.description', 'Start creating amazing Sybau content today. Choose the plan that fits your needs.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{getText('home.pricing.free.title', 'Free')}</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {getText('home.pricing.free.price', '$0')}
                <span className="text-lg font-normal text-gray-600">/{getText('home.pricing.free.period', 'forever')}</span>
              </div>
              <p className="text-gray-600 mb-6">{getText('home.pricing.free.description', 'Perfect for getting started')}</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{getText('home.pricing.free.feature1', '5 generations per day')}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{getText('home.pricing.free.feature2', 'Basic Sybau styles')}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{getText('home.pricing.free.feature3', 'Standard quality')}</span>
                </div>
              </div>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => handlePlanClick('free')}
              >
                {getText('home.cta.getStarted', 'Get Started')}
              </Button>
            </div>

            {/* Standard Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transition-all duration-300 hover:shadow-xl ring-2 ring-purple-500 scale-105 relative">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg rounded-tr-2xl">
                {getText('home.pricing.popular', 'Most Popular')}
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{getText('home.pricing.pro.title', 'Standard')}</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {getText('home.pricing.pro.price', '$9')}
                <span className="text-lg font-normal text-gray-600">/{getText('home.pricing.pro.period', 'per month')}</span>
              </div>
              <p className="text-gray-600 mb-6">{getText('home.pricing.pro.description', 'Best for regular creators')}</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{getText('home.pricing.pro.feature1', '60 generations per month')}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{getText('home.pricing.pro.feature2', 'All Sybau styles')}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{getText('home.pricing.pro.feature3', 'High quality, no watermarks')}</span>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
                onClick={() => handlePlanClick('standard')}
              >
                {getText('home.cta.signUp', 'Sign In Now')}
              </Button>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                <Rocket className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{getText('home.pricing.enterprise.title', 'Professional')}</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {getText('home.pricing.enterprise.price', '$19')}
                <span className="text-lg font-normal text-gray-600">/{getText('home.pricing.enterprise.period', 'per month')}</span>
              </div>
              <p className="text-gray-600 mb-6">{getText('home.pricing.enterprise.description', 'For businesses and power users')}</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{getText('home.pricing.enterprise.feature1', '180 generations per month')}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{getText('home.pricing.enterprise.feature2', 'Exclusive styles + priority support')}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">{getText('home.pricing.enterprise.feature3', 'Ultra high quality + commercial license')}</span>
                </div>
              </div>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => handlePlanClick('professional')}
              >
                {getText('home.cta.choosePlan', 'Choose Plan')}
              </Button>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href={getCurrentLanguage() === 'zh' ? '/zh/pricing' : '/pricing'}
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
            >
              {getText('home.pricing.viewAllPlans', 'View All Plans')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
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
                <span>{getText('home.footer.secure', 'Secure Processing')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{getText('home.footer.speed', '8-Second Generation')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{getText('home.footer.community', 'Global Community')}</span>
              </div>
            </div>

            <p className="text-sm text-white/60">
              {getText('home.footer.features', 'Sybau Picture supports JPG, PNG, WebP formats and text prompts • Google Login • 100% secure')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
