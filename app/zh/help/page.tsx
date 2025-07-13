'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Zap,
  Upload,
  Download,
  Settings,
  Shield,
  Users
} from 'lucide-react'

export default function ZHHelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: '全部', icon: BookOpen },
    { id: 'getting-started', name: '快速开始', icon: Zap },
    { id: 'features', name: '功能介绍', icon: Settings },
    { id: 'upload', name: '上传问题', icon: Upload },
    { id: 'generation', name: '生成问题', icon: Download },
    { id: 'account', name: '账户管理', icon: Users },
    { id: 'technical', name: '技术支持', icon: Shield }
  ]

  const faqData = [
    {
      id: 'how-to-start',
      category: 'getting-started',
      question: '如何开始使用Sybau Picture？',
      answer: '1. 访问我们的生成器 2. 上传图片或输入文字描述 3. 选择Sybau风格 4. 点击生成按钮，等待8秒即可获得您的专属创意作品！体验Stay Young, Beautiful and Unique的文化理念。'
    },
    {
      id: 'supported-formats',
      category: 'upload',
      question: '支持哪些图片格式？',
      answer: '我们支持 JPG、PNG、WebP 格式的图片。建议图片尺寸不超过10MB，分辨率在500x500到2000x2000像素之间效果最佳。'
    },
    {
      id: 'generation-time',
      category: 'generation',
      question: '生成一张图片需要多长时间？',
      answer: '我们的AI引擎通常在8秒内完成图片生成。高峰期可能需要10-15秒。如果超过30秒仍未完成，请刷新页面重试。'
    },
    {
      id: 'free-usage',
      category: 'account',
      question: '免费用户有什么限制？',
      answer: '免费用户享有基础体验配额。标准版用户每月可生成60张，专业版用户每月可生成180张图片，享受优先处理队列。'
    },
    {
      id: 'style-options',
      category: 'features',
      question: '有哪些风格可以选择？',
      answer: '我们专注于体现Stay Young, Beautiful and Unique理念的Sybau风格，包含：经典模式、表现力模式、创意模式和专业模式。每种模式都能表达Z时代的独特美学。'
    },
    {
      id: 'download-quality',
      category: 'generation',
      question: '生成的图片质量如何？',
      answer: '我们生成的图片为高清质量，默认输出1024x1024像素。付费用户可选择更高分辨率，最高支持2048x2048像素。'
    },
    {
      id: 'commercial-use',
      category: 'account',
      question: '可以商业使用生成的图片吗？',
      answer: '是的！您拥有生成图片的完整使用权，可以用于个人和商业目的。但请确保上传的原始图片没有版权问题。'
    },
        {
      id: 'advanced-features',
      category: 'technical',
      question: '专业版有哪些高级功能？',
      answer: '专业版用户享有优先处理队列、更高的图片质量上限、所有高级Sybau风格，以及专属的高级AI功能。'
    }
  ]

  // 过滤FAQ
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4">帮助与支持</Badge>
          <h1 className="text-4xl font-bold mb-6">
            常见问题解答
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            找到关于Sybau Picture的常见问题答案。
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="搜索帮助文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  问题分类
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="mr-2 h-4 w-4" />
                    {category.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* FAQ Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  常见问题解答
                </h2>
                <Badge variant="outline">
                  {filteredFAQs.length} 个问题
                </Badge>
              </div>

              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <CardTitle className="mb-2">没有找到结果</CardTitle>
                    <p className="text-muted-foreground">
                      试试调整搜索关键词或浏览不同分类
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <Card key={faq.id} className="overflow-hidden">
                      <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium">
                            {faq.question}
                          </CardTitle>
                          {expandedFAQ === faq.id ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>

                      {expandedFAQ === faq.id && (
                        <>
                          <Separator />
                          <CardContent className="pt-6">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        </>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
