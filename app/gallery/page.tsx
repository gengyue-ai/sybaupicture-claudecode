'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Heart, Download, Share2, Eye, Star, Sparkles, Zap, Award, Clock, Rocket, Shield, Users, Check } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { generateLocalizedLink } from '@/lib/i18n'

// Static mock data for demonstration - Updated with local Sybau generated images
const mockImages = [
  {
    id: '1',
    processedImage: '/images/gallery/lucky-girl.jpg',
    style: 'classic',
    intensity: 4,
    createdAt: '2024-01-18',
    user: { name: 'SybauCreator', image: '' },
    stats: { views: 25600, likes: 1890, downloads: 720 },
    title: 'Lucky Girl Portrait',
    description: 'A beautiful portrait showcasing the classic Sybau style with gentle enhancement',
    prompt: 'a lucky girl',
    promptDescription: 'Simple yet effective prompt that captures the essence of optimism and beauty'
  },
  {
    id: '2',
    processedImage: '/images/gallery/business-leader.jpg',
    style: 'professional',
    intensity: 3,
    createdAt: '2024-01-17',
    user: { name: 'BusinessPro', image: '' },
    stats: { views: 18400, likes: 1240, downloads: 580 },
    title: 'Confident Business Leader',
    description: 'Professional portrait with Sybau enhancement perfect for corporate use',
    prompt: 'confident business person in suit, professional lighting',
    promptDescription: 'Detailed prompt focusing on professional appearance and lighting'
  },
  {
    id: '3',
    processedImage: '/images/gallery/creative-portrait.jpg',
    style: 'artistic',
    intensity: 5,
    createdAt: '2024-01-16',
    user: { name: 'ArtisticVision', image: '' },
    stats: { views: 34200, likes: 2650, downloads: 1120 },
    title: 'Creative Portrait',
    description: 'Artistic Sybau style capturing unique creative expression',
    prompt: 'artistic portrait with creative composition',
    promptDescription: 'Artistic prompt emphasizing unique visual composition'
  },
  {
    id: '4',
    processedImage: '/images/gallery/contemporary-look.jpg',
    style: 'modern',
    intensity: 4,
    createdAt: '2024-01-15',
    user: { name: 'ModernStyle', image: '' },
    stats: { views: 42800, likes: 3420, downloads: 1680 },
    title: 'Contemporary Look',
    description: 'Modern Sybau processing highlighting contemporary style and expression',
    prompt: 'modern portrait with clean aesthetics',
    promptDescription: 'Contemporary style prompt with emphasis on modern aesthetics'
  },
  {
    id: '5',
    processedImage: '/images/gallery/dynamic-expression.jpg',
    style: 'expressive',
    intensity: 5,
    createdAt: '2024-01-14',
    user: { name: 'ExpressionMaster', image: '' },
    stats: { views: 156700, likes: 12400, downloads: 5680 },
    title: 'Dynamic Expression',
    description: 'High-intensity Sybau creation capturing dynamic emotional expression',
    prompt: 'expressive portrait with dynamic lighting',
    promptDescription: 'Expression-focused prompt with emphasis on dynamic lighting effects'
  },
  {
    id: '6',
    processedImage: '/images/gallery/elegant-portrait.jpg',
    style: 'elegant',
    intensity: 3,
    createdAt: '2024-01-13',
    user: { name: 'ElegantCreator', image: '' },
    stats: { views: 78900, likes: 5670, downloads: 2890 },
    title: 'Elegant Portrait',
    description: 'Sophisticated Sybau style emphasizing elegance and refinement',
    prompt: 'elegant portrait with sophisticated styling',
    promptDescription: 'Elegance-focused prompt emphasizing sophisticated composition'
  }
]

const staticTexts = {
  title: 'Sybau Gallery',
  subtitle: 'Explore Amazing AI-Generated Creative Content',
  description: 'Discover thousands of stunning Sybau creations made by our community with advanced AI technology. Each piece embodies the Gen Z spirit - Stay Young, Beautiful and Unique.',

  backToHome: 'Back to Home',
  allCategories: 'All Sybau Styles',
  likes: 'likes',
  views: 'views',
  downloads: 'downloads',
  createdBy: 'Created by',
  ctaTitle: 'Ready to Create Your Own Sybau Content?',
  ctaDescription: 'Join our community of Sybau creators and express your unique style with AI technology',
  startCreating: 'Start Creating Sybau',

  aboutSybau: 'About Sybau Culture',
  stylesTitle: 'Popular Sybau Styles',
  communityTitle: 'Sybau Community',
  tipsTitle: 'Sybau Creation Tips'
}

const getText = (key: string) => {
  return staticTexts[key as keyof typeof staticTexts] || key
}

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

// Download function
const downloadImage = async (imageUrl: string, filename: string) => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Download failed:', error)
    alert('Download failed, please try again')
  }
}

// Share function
const shareImage = async (imageUrl: string, title: string) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: title,
        text: `Check out this hilarious Sybau meme: ${title}`,
        url: window.location.href + '?image=' + encodeURIComponent(imageUrl)
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareUrl = window.location.href + '?image=' + encodeURIComponent(imageUrl)
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    }
  } catch (error) {
    console.error('Share failed:', error)
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href + '?image=' + encodeURIComponent(imageUrl))
      alert('Share link copied to clipboard!')
    } catch (clipboardError) {
      console.error('Clipboard copy failed:', clipboardError)
      alert('Share failed, please try again')
    }
  }
}

export default function GalleryPage() {
  const pathname = usePathname()

  // Static community stats
  const stats = {
    totalSybauMemes: 45000,
    activeSybauCreators: 12000,
    dailySybauCreations: 850,
    sybauViralRate: 89
  }

  const categories = [
    { id: 'all', name: 'All Sybau Styles', icon: Star, description: 'All Sybau styles' },
    { id: 'classic', name: 'Classic Sybau', icon: Heart, description: 'Traditional Sybau expressions' },
    { id: 'exaggerated', name: 'Exaggerated Sybau', icon: Award, description: 'Intense Sybau effects' },
    { id: 'minimal', name: 'Minimal Sybau', icon: Clock, description: 'Subtle Sybau transformations' },
    { id: 'viral', name: 'Viral Sybau', icon: Star, description: 'Most popular Sybau memes' },
    { id: 'trending', name: 'Trending Sybau', icon: Sparkles, description: 'Latest Sybau trends' },
    { id: 'featured', name: 'Featured Sybau', icon: TrendingUp, description: 'Best Sybau creations' },
    { id: 'community', name: 'Community Sybau', icon: Zap, description: 'User-generated Sybau' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <Badge className="bg-white/20 text-white px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Official Sybau Gallery
            </Badge>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            {getText('title')}
          </h1>
          <h2 className="text-xl lg:text-2xl text-white/90 mb-6">
            {getText('subtitle')}
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
            {getText('description')} Browse through our extensive collection of Sybau masterpieces and get inspired for your next viral creation.
          </p>



          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-purple-400 text-white px-4 py-2">
              <Eye className="w-4 h-4 mr-2" />
              {formatNumber(stats.totalSybauMemes)}+ Sybau Memes
            </Badge>
            <Badge className="bg-pink-400 text-white px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {formatNumber(stats.activeSybauCreators)}+ Creators
            </Badge>
            <Badge className="bg-cyan-400 text-white px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              {stats.sybauViralRate}% Viral Rate
            </Badge>
          </div>

          <div>
            <Link href="/">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {getText('backToHome')}
              </Button>
            </Link>
            <Link href="/generator">
              <Button className="bg-white text-purple-600 font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                {getText('startCreating')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {getText('stylesTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <div key={category.id} className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl transition-all duration-200 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mx-auto mb-3">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-600">{category.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-gradient-to-br from-purple-50 via-white to-cyan-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Featured Sybau Creations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockImages.map((image) => (
              <Card key={image.id} className="bg-white shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={image.processedImage}
                      alt={`Sybau ${image.style} meme`}
                      className="w-full h-64 object-cover transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-purple-500 text-white capitalize">
                        {image.style}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm font-medium">{getText('createdBy')} {image.user.name}</span>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {formatNumber(image.stats.views)}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {formatNumber(image.stats.likes)}
                          </span>
                          <span className="flex items-center">
                            <Download className="w-4 h-4 mr-1" />
                            {formatNumber(image.stats.downloads)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{image.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{image.description}</p>

                    {/* Prompt Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center mb-2">
                        <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm font-medium text-purple-700">Prompt Used:</span>
                      </div>
                      <p className="text-sm font-mono bg-white px-2 py-1 rounded border italic">
                        "{image.prompt}"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{image.promptDescription}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          Intensity: {image.intensity}/5
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600"
                          onClick={() => downloadImage(image.processedImage, `sybau-${image.style}-${image.id}.jpg`)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600"
                          onClick={() => shareImage(image.processedImage, image.title)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Sybau Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              {getText('aboutSybau')}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Sybau is a unique AI-driven meme generation style that transforms ordinary photos into viral content. Our advanced algorithms analyze facial expressions, lighting, and composition to create the perfect Sybau effect that resonates with global audiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <Rocket className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">Generate professional-grade Sybau memes in just 8 seconds using our optimized AI technology.</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-pink-100 to-cyan-100 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Secure & Private</h3>
              <p className="text-gray-600">Your images are processed securely and never stored on our servers. Complete privacy guaranteed.</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Global Community</h3>
              <p className="text-gray-600">Join millions of creators worldwide who trust Sybau for their viral content needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
              {getText('tipsTitle')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Best Photo Tips
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                    Use high-resolution images (1080p or higher) for best Sybau results
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                    Ensure good lighting and clear facial features for optimal processing
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                    Center the subject in the frame for balanced Sybau composition
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  Viral Success Tips
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3"></span>
                    Experiment with different intensity levels to find your perfect Sybau style
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3"></span>
                    Share your Sybau creations during peak social media hours
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3"></span>
                    Use trending hashtags and engage with the Sybau community
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
              {getText('ctaTitle')}
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
              {getText('ctaDescription')}
            </p>

            <div className="flex justify-center">
              <Link href={generateLocalizedLink('/generator', pathname)}>
                <Button
                  size="lg"
                  className="bg-white text-purple-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  {getText('startCreating')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
