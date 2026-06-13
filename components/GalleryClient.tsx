'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DouAd } from '@/components/AdUnit'
import { TrendingUp, Heart, Download, Share2, Eye, Star, Sparkles, Zap, Award, Clock, Rocket, Shield, Users, Check, ArrowRight, Play } from 'lucide-react'

// FLUX引擎9大应用场景数据
const applicationScenarios = [
  // 生活增强类
  {
    id: 'watermark-removal',
    category: 'life-enhancement',
    title: { zh: '智能去水印', en: 'Smart Watermark Removal' },
    description: { zh: '一键去除各种复杂水印，保持背景完整', en: 'Remove any complex watermarks with one click' },
    icon: '✨',
    processingTime: { zh: '12秒', en: '12s' },
    examples: [
      {
        beforeImg: '/images/examples/watermark-before.webp',
        afterImg: '/images/examples/watermark-after.webp',
        prompt: { zh: '移除所有水印和文字覆盖层，保持人物和背景完全不变', en: 'Remove watermark, keep background intact' }
      }
    ],
    features: [
      { zh: '支持各种水印类型', en: 'Support various watermark types' },
      { zh: '智能背景修复', en: 'Intelligent background repair' },
      { zh: '保持原图质量', en: 'Maintain original quality' }
    ]
  },
  {
    id: 'body-optimization',
    category: 'life-enhancement',
    title: { zh: '身材优化', en: 'Body Optimization' },
    description: { zh: '瘦脸/瘦腿/减肚子/增肌，自然无痕', en: 'Face slimming/leg slimming/belly reduction/muscle enhancement, natural and seamless' },
    icon: '💪',
    processingTime: { zh: '15秒', en: '15s' },
    examples: [
      {
        beforeImg: '/images/examples/body-before.webp',
        afterImg: '/images/examples/body-after.webp', 
        prompt: { zh: '自然瘦身，保持面部特征', en: 'Natural body slimming, keep facial features' }
      }
    ],
    features: [
      { zh: '自然瘦身效果', en: 'Natural slimming effects' },
      { zh: '保持面部特征', en: 'Preserve facial features' },
      { zh: '智能比例调整', en: 'Smart proportion adjustment' }
    ]
  },
  {
    id: 'tourist-removal',
    category: 'life-enhancement',
    title: { zh: '路人移除', en: 'Tourist Removal' },
    description: { zh: '独享美景，告别路人抢镜', en: 'Enjoy scenery alone, say goodbye to photobombers' },
    icon: '🏞️',
    processingTime: { zh: '18秒', en: '18s' },
    examples: [
      {
        beforeImg: '/images/examples/tourist-before.webp',
        afterImg: '/images/examples/tourist-after.webp',
        prompt: { zh: '移除照片中的路人，保持风景完整', en: 'Remove people from photo, keep scenery intact' }
      }
    ],
    features: [
      { zh: '精准人物识别', en: 'Precise person detection' },
      { zh: '背景无缝修复', en: 'Seamless background repair' },
      { zh: '保持景物细节', en: 'Preserve scenic details' }
    ]
  },
  // 商业创作类
  {
    id: 'ecommerce-display',
    category: 'business-creation',
    title: { zh: '电商展示图', en: 'E-commerce Display Images' },
    description: { zh: '一键生成专业产品展示图', en: 'Generate professional product images with one click' },
    icon: '🛍️',
    processingTime: { zh: '16秒', en: '16s' },
    examples: [
      {
        beforeImg: '/images/examples/product-before.webp',
        afterImg: '/images/examples/product-after.webp',
        prompt: { zh: '生成专业的电商产品展示场景', en: 'Generate professional e-commerce product scene' }
      }
    ],
    features: [
      { zh: '专业展示场景', en: 'Professional display scenes' },
      { zh: '产品细节增强', en: 'Product detail enhancement' },
      { zh: '多样化背景', en: 'Diverse backgrounds' }
    ]
  },
  {
    id: 'background-replacement',
    category: 'business-creation',
    title: { zh: '背景替换', en: 'Background Replacement' },
    description: { zh: '瞬间穿越，任意场景切换', en: 'Instant space travel, change any scene' },
    icon: '🌍',
    processingTime: { zh: '18秒', en: '18s' },
    examples: [
      {
        beforeImg: '/images/examples/bg-before.webp',
        afterImg: '/images/examples/bg-after.webp',
        prompt: { zh: '将背景替换为夕阳海滩', en: 'Replace background with sunset beach' }
      }
    ],
    features: [
      { zh: '精准边缘检测', en: 'Precise edge detection' },
      { zh: '自然光影融合', en: 'Natural lighting blend' },
      { zh: '无限场景选择', en: 'Unlimited scene options' }
    ]
  },
  {
    id: 'element-integration',
    category: 'business-creation',
    title: { zh: '元素融合', en: 'Element Integration' },
    description: { zh: '多图合成，让模特拿着你的产品', en: 'Multi-image combination, let models hold your products' },
    icon: '🔗',
    processingTime: { zh: '20秒', en: '20s' },
    examples: [
      {
        beforeImg: '/images/examples/integration-before.webp',
        afterImg: '/images/examples/integration-after.webp',
        prompt: { zh: '让模特手中拿着这个产品', en: 'Make model hold this product in hand' }
      }
    ],
    features: [
      { zh: '智能元素融合', en: 'Smart element integration' },
      { zh: '自然手势生成', en: 'Natural gesture generation' },
      { zh: '光影匹配', en: 'Lighting matching' }
    ]
  },
  // 创意转换类
  {
    id: 'style-conversion',
    category: 'creative-conversion',
    title: { zh: '风格转换', en: 'Style Conversion' },
    description: { zh: '真人照片↔动漫，一键风格切换', en: 'Real photo ↔ Anime, one-click style switching' },
    icon: '🎨',
    processingTime: { zh: '14秒', en: '14s' },
    examples: [
      {
        beforeImg: '/images/examples/style-before.webp',
        afterImg: '/images/examples/style-after.webp',
        prompt: { zh: '转换为日式动漫风格', en: 'Convert to Japanese anime style' }
      }
    ],
    features: [
      { zh: '多种艺术风格', en: 'Multiple art styles' },
      { zh: '保持人物特征', en: 'Preserve character features' },
      { zh: '高质量转换', en: 'High-quality conversion' }
    ]
  },
  {
    id: 'text-editing',
    category: 'creative-conversion', 
    title: { zh: '文字编辑', en: 'Text Editing' },
    description: { zh: '自由修改海报文字，支持任意字体', en: 'Modify poster text freely, support any fonts' },
    icon: '📝',
    processingTime: { zh: '10秒', en: '10s' },
    examples: [
      {
        beforeImg: '/images/examples/text-before.webp',
        afterImg: '/images/examples/text-after.webp',
        prompt: { zh: '将标题改为新的促销文案', en: 'Change title to new promotional text' }
      }
    ],
    features: [
      { zh: '智能文字识别', en: 'Smart text recognition' },
      { zh: '字体风格匹配', en: 'Font style matching' },
      { zh: '布局自动调整', en: 'Auto layout adjustment' }
    ]
  },
  {
    id: 'detail-modification',
    category: 'creative-conversion',
    title: { zh: '细节修改', en: 'Detail Modification' },
    description: { zh: '加墨镜、换甜品，轻松微调', en: 'Add sunglasses, change desserts, effortless fine-tuning' },
    icon: '🔧',
    processingTime: { zh: '12秒', en: '12s' },
    examples: [
      {
        beforeImg: '/images/examples/detail-before.webp',
        afterImg: '/images/examples/detail-after.webp',
        prompt: { zh: '给人物添加时尚墨镜', en: 'Add stylish sunglasses to the person' }
      }
    ],
    features: [
      { zh: '精细局部编辑', en: 'Precise local editing' },
      { zh: '自然物体融合', en: 'Natural object blending' },
      { zh: '细节优化', en: 'Detail optimization' }
    ]
  }
]

// 旧的静态图片数据（保留用于兼容）
const legacyImages = [
  {
    id: '1',
    title: '幸运女孩肖像',
    description: '展示经典Sybau风格的美丽肖像，温和的AI增强效果',
    imageUrl: '/images/gallery/lucky-girl.jpg',
    likes: 1890,
    downloads: 720,
    views: 25600,
    category: 'classic',
    tags: ['Sybau', '经典', '肖像'],
    creator: 'Sybau创作者',
    prompt: 'a lucky girl',
    promptDescription: '简单而有效的提示词，捕捉乐观和美丽的本质',
    intensity: 4,
    createdAt: '2024-01-18'
  },
  {
    id: '2',
    title: '自信商业领袖',
    description: '专业肖像，Sybau增强效果，完美适合商务使用',
    imageUrl: '/images/gallery/business-leader.jpg',
    likes: 1240,
    downloads: 580,
    views: 18400,
    category: 'professional',
    tags: ['Sybau', '商务', '专业'],
    creator: '商务专家',
    prompt: 'confident business person in suit, professional lighting',
    promptDescription: '详细的提示词，专注于专业外观和灯光效果',
    intensity: 3,
    createdAt: '2024-01-17'
  },
  {
    id: '3',
    title: '创意肖像',
    description: '艺术性Sybau风格，捕捉独特的创意表达',
    imageUrl: '/images/gallery/creative-portrait.jpg',
    likes: 2650,
    downloads: 1120,
    views: 34200,
    category: 'artistic',
    tags: ['Sybau', '艺术', '创意'],
    creator: '艺术视觉',
    prompt: 'artistic portrait with creative composition',
    promptDescription: '艺术提示词，强调独特的视觉构图',
    intensity: 5,
    createdAt: '2024-01-16'
  },
  {
    id: '4',
    title: '现代风格',
    description: '现代Sybau处理，突出当代风格和表达',
    imageUrl: '/images/gallery/contemporary-look.jpg',
    likes: 3420,
    downloads: 1680,
    views: 42800,
    category: 'modern',
    tags: ['Sybau', '现代', '时尚'],
    creator: '现代风格师',
    prompt: 'modern portrait with clean aesthetics',
    promptDescription: '现代风格提示词，强调当代美学',
    intensity: 4,
    createdAt: '2024-01-15'
  },
  {
    id: '5',
    title: '动态表情',
    description: '高强度Sybau创作，捕捉动态情感表达',
    imageUrl: '/images/gallery/dynamic-expression.jpg',
    likes: 12400,
    downloads: 5680,
    views: 156700,
    category: 'expressive',
    tags: ['Sybau', '表情', '动态'],
    creator: '表情大师',
    prompt: 'expressive portrait with dynamic lighting',
    promptDescription: '专注于表情的提示词，强调动态灯光效果',
    intensity: 5,
    createdAt: '2024-01-14'
  },
  {
    id: '6',
    title: '优雅肖像',
    description: '精致Sybau风格，强调优雅和精致',
    imageUrl: '/images/gallery/elegant-portrait.jpg',
    likes: 5670,
    downloads: 2890,
    views: 78900,
    category: 'elegant',
    tags: ['Sybau', '优雅', '精致'],
    creator: '优雅创作者',
    prompt: 'elegant portrait with sophisticated styling',
    promptDescription: '优雅提示词，强调精致的构图',
    intensity: 3,
    createdAt: '2024-01-13'
  }
]

const categories = [
  { id: 'all', name: '全部Sybau作品', count: 125000 },
  { id: 'trending', name: '热门Sybau', count: 15000 },
  { id: 'classic', name: '经典Sybau', count: 25000 },
  { id: 'fun', name: '有趣Sybau', count: 18000 },
  { id: 'professional', name: '专业Sybau', count: 12000 },
  { id: 'creative', name: '创意Sybau', count: 20000 },
  { id: 'sports', name: '运动Sybau', count: 8000 }
]

const stats = [
  { number: '1,250,000+', label: 'Sybau作品总数' },
  { number: '250,000+', label: 'Sybau创作者' },
  { number: '50M+', label: 'Sybau浏览量' },
  { number: '4.9/5', label: 'Sybau用户评分' }
]

export default function GalleryClient() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeCategory, setActiveCategory] = useState('all')
  
  const getCurrentLanguage = () => {
    return pathname.startsWith('/zh') ? 'zh' : 'en'
  }
  
  const currentLang = getCurrentLanguage()
  
  const getText = (zhText: string, enText: string) => {
    return currentLang === 'zh' ? zhText : enText
  }

  const handleTryScenario = (scenarioId: string) => {
    // 跳转到创作区并加载模板
    const homePath = currentLang === 'zh' ? '/zh' : '/'
    router.push(`${homePath}?template=${scenarioId}#generator-section`)
  }

  const categoryMap = {
    'life-enhancement': { zh: '生活增强', en: 'Life Enhancement', icon: '🎨' },
    'business-creation': { zh: '商业创作', en: 'Business Creation', icon: '🛍️' },
    'creative-conversion': { zh: '创意转换', en: 'Creative Conversion', icon: '🎭' }
  }

  const filteredScenarios = activeCategory === 'all' 
    ? applicationScenarios 
    : applicationScenarios.filter(scenario => scenario.category === activeCategory)

  const stats = [
    { number: getText('120亿', '12B'), label: getText('参数规模', 'Parameters') },
    { number: getText('15秒', '15s'), label: getText('平均处理时间', 'Avg Processing') },
    { number: getText('9大', '9'), label: getText('应用场景', 'Scenarios') },
    { number: '4.9/5', label: getText('用户评分', 'User Rating') }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      <div className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            {getText('FLUX引擎应用案例库', 'FLUX Engine Application Gallery')}
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            {getText('探索FLUX引擎的无限可能', 'Explore FLUX Engine Possibilities')}
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            {getText(
              '基于FLUX Pro + Kontext双引擎的专业AI图像编辑平台。9大应用场景，120亿参数模型，15秒生成专业级作品。从智能去水印到风格转换，满足您的所有创意需求。',
              'Professional AI image editing platform powered by FLUX Pro + Kontext dual engines. 9 application scenarios, 12 billion parameter model, 15-second generation of professional works. From smart watermark removal to style conversion, meet all your creative needs.'
            )}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">{getText('应用场景分类', 'Application Categories')}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              className="px-4 py-2 cursor-pointer hover:bg-purple-50 border-purple-200"
              onClick={() => setActiveCategory('all')}
            >
              {getText('全部场景', 'All Scenarios')} ({getText('9', '9')})
            </Badge>
            {Object.entries(categoryMap).map(([key, category]) => (
              <Badge
                key={key}
                variant={activeCategory === key ? 'default' : 'outline'}
                className="px-4 py-2 cursor-pointer hover:bg-purple-50 border-purple-200"
                onClick={() => setActiveCategory(key)}
              >
                {category.icon} {getText(category.zh, category.en)} ({getText('3', '3')})
              </Badge>
            ))}
          </div>
        </div>

        {/* 9大应用场景展示 */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">{getText('FLUX引擎应用场景', 'FLUX Engine Application Scenarios')}</h2>
            <p className="text-lg text-gray-600">{getText('专业AI图像编辑的完整解决方案', 'Complete solution for professional AI image editing')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredScenarios.flatMap((scenario, index) => {
              const cards = [
                <Card key={scenario.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white border border-gray-200 rounded-xl group">
                <div className="relative">
                  {/* Before/After 对比展示 - 优化版本 */}
                  <div className="grid grid-cols-2 gap-1 h-72">
                    <div className="relative overflow-hidden group">
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-red-500/95 text-white text-xs px-2 py-1 backdrop-blur-sm shadow-sm">
                          {getText('处理前', 'Before')}
                        </Badge>
                      </div>
                      <Image
                        src={scenario.examples[0].beforeImg}
                        alt={`${getText(scenario.title.zh, scenario.title.en)} - Before`}
                        width={600}
                        height={450}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    </div>
                    <div className="relative overflow-hidden group">
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-green-500/95 text-white text-xs px-2 py-1 backdrop-blur-sm shadow-sm">
                          {getText('处理后', 'After')}
                        </Badge>
                      </div>
                      <Image
                        src={scenario.examples[0].afterImg}
                        alt={`${getText(scenario.title.zh, scenario.title.en)} - After`}
                        width={600}
                        height={450}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    </div>
                  </div>
                  
                  {/* 处理时间标识 */}
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-black/80 text-white text-xs px-2 py-1 backdrop-blur-sm shadow-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {getText(scenario.processingTime.zh, scenario.processingTime.en)}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="text-2xl mr-3 p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                      {scenario.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">
                        {getText(scenario.title.zh, scenario.title.en)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getText('FLUX引擎处理', 'FLUX Engine Processing')} • {getText(scenario.processingTime.zh, scenario.processingTime.en)}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    {getText(scenario.description.zh, scenario.description.en)}
                  </p>

                  {/* 功能特点 */}
                  <div className="mb-5">
                    <div className="text-sm font-medium text-gray-700 mb-2">{getText('核心功能', 'Key Features')}:</div>
                    <div className="space-y-1">
                      {scenario.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-600">
                          <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {getText(feature.zh, feature.en)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 推荐提示词 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-5 border border-purple-100">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-purple-700">{getText('推荐提示词', 'Recommended Prompt')}:</span>
                    </div>
                    <p className="text-xs font-mono bg-white px-2 py-2 rounded border italic text-gray-700">
                      "{getText(scenario.examples[0].prompt.zh, scenario.examples[0].prompt.en)}"
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-sm py-2"
                      onClick={() => handleTryScenario(scenario.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {getText('立即尝试', 'Try Now')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-3 border-purple-200 hover:bg-purple-50"
                      onClick={() => {
                        navigator.clipboard.writeText(getText(scenario.examples[0].prompt.zh, scenario.examples[0].prompt.en));
                        alert(getText('提示词已复制', 'Prompt copied'));
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ];
              
              // 广告位 ③ - 9场景网格第3个卡片后（第一行结束），自然中断点
              if (index === 2 && filteredScenarios.length > 3) {
                cards.push(
                  <div key="ad-gallery-mid" className="flex items-center justify-center min-h-[250px]">
                    <DouAd className="w-full" />
                  </div>
                );
              }
              
              return cards;
            })}
          </div>
        </div>

        {/* 新手指南提示 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {getText('🔰 新手上路指南', '🔰 Beginner\'s Guide')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              {getText(
                '不知道如何写提示词？我们为您准备了详细的使用教程，包含9大场景的提示词模板、使用技巧和常见问题解答。',
                'Don\'t know how to write prompts? We\'ve prepared detailed tutorials for you, including prompt templates for 9 scenarios, usage tips, and FAQs.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={currentLang === 'zh' ? '/zh/help' : '/help'}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-3"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {getText('查看提示词指南', 'View Prompt Guide')}
                </Button>
              </Link>
              <Link href={currentLang === 'zh' ? '/zh' : '/'}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  {getText('开始创作', 'Start Creating')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-8 rounded-3xl">
          <h2 className="text-3xl font-bold mb-4">
            {getText('准备体验FLUX引擎的强大功能了吗？', 'Ready to Experience FLUX Engine\'s Power?')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {getText(
              '使用基于120亿参数的FLUX Pro引擎，15秒生成专业级AI图像编辑作品。9大应用场景，满足您的所有创意需求。',
              'Use FLUX Pro engine with 12 billion parameters to generate professional AI image editing works in 15 seconds. 9 application scenarios to meet all your creative needs.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={currentLang === 'zh' ? '/zh' : '/'}>
              <Button
                size="lg"
                className="bg-white text-purple-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <Rocket className="mr-2 h-5 w-5" />
                {getText('立即开始创作', 'Start Creating Now')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}