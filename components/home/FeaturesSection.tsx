'use client'

import { Sparkles, Rocket, Heart, Shield, Users, Clock } from 'lucide-react'
import { getText, type TextKey } from '@/lib/staticTexts'

interface FeaturesSectionProps {
  currentLang: 'en' | 'zh'
}

export function FeaturesSection({ currentLang }: FeaturesSectionProps) {
  const getLocalizedText = (key: TextKey, fallback?: string) => {
    return getText(currentLang, key, fallback)
  }

  const features = [
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
  ]

  return (
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
          {features.map((feature, index) => (
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
  )
}