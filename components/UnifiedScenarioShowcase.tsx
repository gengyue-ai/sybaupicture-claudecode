'use client'

import { useState } from 'react'
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

// 场景数据定义 - 基于用户提供的示例图片精确定义
const scenarios = {
  photography: {
    name: '摄影',
    nameEn: 'Photography',
    icon: '📷',
    beforeImage: '/images/scenarios/photography-before.webp',
    afterImage: '/images/scenarios/photography-after.webp',
    prompt: '移除全家福中的指定人物，保持背景和其他人物完整',
    promptEn: 'Remove specific people from family photo while keeping background and other people intact',
    description: '全家福人物选择性移除',
    descriptionEn: 'Selective people removal from family photos'
  },
  ecommerce: {
    name: '电商',
    nameEn: 'E-commerce',
    icon: '🛒',
    beforeImage: '/images/scenarios/ecommerce-before.webp',
    afterImage: '/images/scenarios/ecommerce-after.webp',
    prompt: '将产品背景替换为科技光效背景，增强视觉冲击',
    promptEn: 'Replace product background with futuristic tech lighting effects for visual impact',
    description: '产品背景专业替换',
    descriptionEn: 'Professional product background replacement'
  },
  fashion: {
    name: '时尚',
    nameEn: 'Fashion',
    icon: '💎',
    beforeImage: '/images/scenarios/fashion-before.webp',
    afterImage: '/images/scenarios/fashion-after.webp',
    prompt: '调整人物色温风格，从暖色调变成冷色调霓虹效果',
    promptEn: 'Adjust portrait color temperature from warm tones to cool neon style effects',
    description: '人物色温风格调整',
    descriptionEn: 'Portrait color temperature style adjustment'
  },
  travel: {
    name: '旅行',
    nameEn: 'Travel',
    icon: '✈️',
    beforeImage: '/images/scenarios/travel-before.webp',
    afterImage: '/images/scenarios/travel-after.webp',
    prompt: '移除景区路人，只保留主要人物，营造私密浪漫氛围',
    promptEn: 'Remove tourists from scenic spots, keep only main subjects for intimate romantic atmosphere',
    description: '景区路人智能移除',
    descriptionEn: 'Smart tourist removal from scenic locations'
  },
  realestate: {
    name: '房地产',
    nameEn: 'Real Estate',
    icon: '🏠',
    beforeImage: '/images/scenarios/realestate-before.webp',
    afterImage: '/images/scenarios/realestate-after.webp',
    prompt: '整理房间杂物，优化家具摆放，营造温馨展示氛围',
    promptEn: 'Organize room clutter, optimize furniture placement, create cozy display atmosphere',
    description: '室内空间优化整理',
    descriptionEn: 'Interior space optimization and organization'
  }
}

interface UnifiedScenarioShowcaseProps {
  currentLang?: string
}

export default function UnifiedScenarioShowcase({ currentLang = 'zh' }: UnifiedScenarioShowcaseProps) {
  const [activeScenario, setActiveScenario] = useState<keyof typeof scenarios>('photography')

  const getText = (zhText: string, enText: string) => {
    return currentLang === 'zh' ? zhText : enText
  }

  const scrollToGenerator = (scenarioKey: string) => {
    // 映射首页场景到专属模板ID
    const scenarioToTemplateMap = {
      photography: 'photography-showcase', // 全家福人物移除
      ecommerce: 'ecommerce-showcase', // 产品背景替换  
      fashion: 'fashion-showcase', // 人物色温调整
      travel: 'travel-showcase', // 景区路人移除
      realestate: 'realestate-showcase' // 室内空间整理
    }
    
    const templateId = scenarioToTemplateMap[scenarioKey as keyof typeof scenarioToTemplateMap]
    if (templateId) {
      // 跳转到创作区并加载模板
      const homePath = currentLang === 'zh' ? '/zh' : '/'
      window.location.href = `${homePath}?template=${templateId}#generator-section`
    }
  }

  const currentScenarioData = scenarios[activeScenario]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            {getText('AI处理能力展示', 'AI Processing Capabilities')}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
            {getText('AI 处理照片编辑 任何场景', 'AI Photo Editing for Any Scenario')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getText('专业级AI图像处理，适配不同场景需求，一键实现完美效果', 'Professional AI image processing for different scenarios, perfect results with one click')}
          </p>
        </div>

        {/* Scenario Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => setActiveScenario(key as keyof typeof scenarios)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeScenario === key
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="text-lg">{scenario.icon}</span>
                <span>{getText(scenario.name, scenario.nameEn)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Display Area */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
            {/* Before/After Comparison */}
            <div className="relative flex justify-center items-center p-4">
              <BeforeAfterSlider
                beforeImage={currentScenarioData.beforeImage}
                afterImage={currentScenarioData.afterImage}
                beforeLabel={getText('处理前', 'Before')}
                afterLabel={getText('处理后', 'After')}
                className="mx-auto"
                width={800}
                height={500}
              />
            </div>
            
            {/* Action Area */}
            <div className="p-8 text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {getText(currentScenarioData.description, currentScenarioData.descriptionEn)}
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {getText(currentScenarioData.prompt, currentScenarioData.promptEn)}
                </p>
              </div>
              
              {/* Create Similar Button */}
              <Button
                onClick={() => scrollToGenerator(activeScenario)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="mr-2">🎨</span>
                {getText('立即创作同款', 'Create Similar Now')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}