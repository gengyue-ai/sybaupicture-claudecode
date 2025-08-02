'use client'

import { Star, TrendingUp, Rocket, Heart } from 'lucide-react'
import { getText, type TextKey } from '@/lib/staticTexts'

interface FluxEngineSectionProps {
  currentLang: 'en' | 'zh'
}

export function FluxEngineSection({ currentLang }: FluxEngineSectionProps) {
  const getLocalizedText = (key: TextKey, fallback?: string) => {
    return getText(currentLang, key, fallback)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-cyan-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
            {getLocalizedText('home.flux.title', 'FLUX Pro + Kontext Dual Engine')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getLocalizedText('home.flux.subtitle', 'Industry-leading AI image editing technology')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Technical Parameters */}
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{getLocalizedText('home.flux.param12b', '12 Billion Parameters')}</h3>
            <p className="text-gray-600 text-sm">{getLocalizedText('home.flux.param12b.desc', 'Flow transformer architecture')}</p>
          </div>

          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{getLocalizedText('home.flux.topelo', 'Highest Elo Score')}</h3>
            <p className="text-gray-600 text-sm">{getLocalizedText('home.flux.topelo.desc', 'Top ranking on Artificial Analysis arena')}</p>
          </div>

          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
              <Rocket className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{getLocalizedText('home.flux.speed6x', '6x Speed Boost')}</h3>
            <p className="text-gray-600 text-sm">{getLocalizedText('home.flux.speed6x.desc', '4x faster than other platforms')}</p>
          </div>

          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{getLocalizedText('home.flux.multimodal', 'Multimodal Understanding')}</h3>
            <p className="text-gray-600 text-sm">{getLocalizedText('home.flux.multimodal.desc', 'Text + image input processing')}</p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mt-12">
          <div className="flex items-start space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">{getLocalizedText('home.flux.localediting', 'Precise Local Editing')}</h4>
              <p className="text-gray-600">{getLocalizedText('home.flux.localediting.desc', 'Targeted area modifications')}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">{getLocalizedText('home.flux.consistency', 'Character Consistency')}</h4>
              <p className="text-gray-600">{getLocalizedText('home.flux.consistency.desc', 'Maintain coherence across edits')}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">{getLocalizedText('home.flux.notuning', 'No Fine-tuning Required')}</h4>
              <p className="text-gray-600">{getLocalizedText('home.flux.notuning.desc', 'Professional results out-of-the-box')}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">{getLocalizedText('home.benefits.quality', 'Professional Quality')}</h4>
              <p className="text-gray-600">{getLocalizedText('home.benefits.quality.desc', 'Commercial-grade output')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}