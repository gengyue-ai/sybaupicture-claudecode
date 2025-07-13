'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Heart, Download, Share2, Eye, Star, Sparkles, Zap, Award, Clock, Rocket, Shield, Users, Check } from 'lucide-react'

// 静态真实案例数据 - 更新为本地Sybau生成图片
const mockImages = [
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

export default function ZHGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      <div className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Sybau创意画廊
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            探索Sybau世界
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            欢迎来到Sybau创意内容的终极画廊！在这里，您可以发现数千个由我们全球社区使用先进AI技术创建的令人惊叹的Sybau作品。每个Sybau创作都体现了Stay Young, Beautiful and Unique的Z时代精神，展现了AI与人类创意的完美结合。
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
          <h2 className="text-2xl font-bold mb-6 text-center">Sybau分类</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="px-4 py-2 cursor-pointer hover:bg-purple-50 border-purple-200"
              >
                {category.name} ({category.count.toLocaleString()})
              </Badge>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Sybau杰作展示</h2>
            <p className="text-lg text-gray-600">发现我们社区最受欢迎的Sybau创意作品</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockImages.map((image) => (
              <Card key={image.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <div className="relative">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge className="bg-purple-500 text-white">
                      <Eye className="w-3 h-3 mr-1" />
                      {image.views.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium">作者：{image.creator}</span>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {image.likes}
                        </span>
                        <span className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {image.downloads}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{image.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{image.description}</p>

                  {/* 提示词部分 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-purple-700">使用的提示词：</span>
                    </div>
                    <p className="text-sm font-mono bg-white px-2 py-1 rounded border italic">
                      "{image.prompt}"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{image.promptDescription}</p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap gap-1">
                      {image.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>强度: {image.intensity}/5</span>
                      <span>•</span>
                      <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = image.imageUrl;
                        link.download = `sybau-${image.category}-${image.id}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: image.title,
                            text: image.description,
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('链接已复制到剪贴板');
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      分享
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-8 rounded-3xl">
          <h2 className="text-3xl font-bold mb-4">准备创建您的Sybau杰作了吗？</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            加入我们的Sybau社区，使用最先进的AI技术创建令人惊叹的创意内容。体验Stay Young, Beautiful and Unique的生活方式，让您的创意在Sybau画廊中闪耀！
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/zh">
              <Button
                size="lg"
                className="bg-white text-purple-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg"
              >
                <Rocket className="mr-2 h-5 w-5" />
                开始创作Sybau
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
