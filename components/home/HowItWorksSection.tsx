'use client'

import { Users, Sparkles, Award } from 'lucide-react'
import { getText, type TextKey } from '@/lib/staticTexts'

interface HowItWorksSectionProps {
  currentLang: 'en' | 'zh'
}

export function HowItWorksSection({ currentLang }: HowItWorksSectionProps) {
  const getLocalizedText = (key: TextKey, fallback?: string) => {
    return getText(currentLang, key, fallback)
  }

  const steps = [
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
  ]

  return (
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
          {steps.map((step, index) => (
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
  )
}