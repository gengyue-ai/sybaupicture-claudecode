'use client'

import { getText, type TextKey } from '@/lib/staticTexts'

interface ComparisonSectionProps {
  currentLang: 'en' | 'zh'
}

export function ComparisonSection({ currentLang }: ComparisonSectionProps) {
  const getLocalizedText = (key: TextKey, fallback?: string) => {
    return getText(currentLang, key, fallback)
  }

  return (
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
  )
}