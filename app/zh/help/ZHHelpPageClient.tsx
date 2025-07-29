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
  ChevronRight,
  Zap,
  Settings,
  Shield,
  CreditCard,
  ImageIcon,
  Palette,
  Archive
} from 'lucide-react'

export default function ZHHelpPageClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: '全部话题', icon: BookOpen },
    { id: 'getting-started', name: '快速开始', icon: Zap },
    { id: 'templates', name: '模板功能', icon: Palette },
    { id: 'assets', name: '我的资产', icon: Archive },
    { id: 'pricing', name: '套餐价格', icon: CreditCard },
    { id: 'usage', name: '使用权限', icon: ImageIcon },
    { id: 'troubleshooting', name: '故障排除', icon: Settings },
    { id: 'privacy', name: '隐私安全', icon: Shield }
  ]

  const faqData = [
    // 快速开始
    {
      id: '1',
      category: 'getting-started',
      question: '如何开始使用Sybau Picture？',
      answer: '我们的AI融合了Z时代文化和Sybau理念 - Stay Young, Beautiful and Unique。选择文生图模式（输入文字描述）或图生图模式（上传并转换），选择您喜欢的风格，几秒钟内获得专业效果。'
    },
    {
      id: '2',
      category: 'getting-started',
      question: '文生图和图生图模式有什么区别？',
      answer: '文生图根据您的文字描述创建全新图片。图生图则是对您上传的照片进行AI转换 - 非常适合编辑、风格变换或增强效果。两种模式都支持我们的4种专业风格。'
    },
    {
      id: '3',
      category: 'getting-started',
      question: '支持哪些图片格式？',
      answer: '我们支持JPG、PNG和WebP格式。图片大小应控制在5MB以内，分辨率在512x512到2048x2048像素之间效果最佳。'
    },
    {
      id: '4',
      category: 'getting-started',
      question: '如何下载生成的图片？',
      answer: '生成完成后点击下载按钮即可保存到设备。所有图片都以高质量JPG格式保存。您也可以稍后在"我的资产"中访问它们。'
    },

    // 模板功能
    {
      id: '5',
      category: 'templates',
      question: '模板是什么，如何使用？',
      answer: '模板是针对特定任务的预配置AI设置，如去水印、身材优化或背景替换。点击模板库按钮浏览14个专业模板，分为3大类：生活增强、商业创作、创意转换。'
    },
    {
      id: '6',
      category: 'templates',
      question: '免费用户可以使用哪些模板？',
      answer: '免费用户可使用3个基础模板：智能去水印、身材优化、游客移除。标准用户可使用5个模板，专业用户解锁全部14个专业模板。'
    },
    {
      id: '7',
      category: 'templates',
      question: '有哪些AI风格可以选择？',
      answer: '我们提供4种专业风格：经典（均衡美学）、专业（精致商务）、表现力（大胆表达）、创意（富有想象力）。免费用户可使用经典和专业风格，付费用户解锁所有风格。'
    },

    // 我的资产
    {
      id: '8',
      category: 'assets',
      question: '如何管理我生成的图片？',
      answer: '在个人资料中访问"我的资产"查看所有生成的图片，按日期整理。您可以查看、下载或删除个人画廊中的图片。生成时图片会自动保存。'
    },
    {
      id: '9',
      category: 'assets',
      question: '我的图片会保存多长时间？',
      answer: '您生成的图片会永久保存在账户中，除非您主动删除。您拥有无限存储空间，可随时从"我的资产"访问所有创作。'
    },

    // 套餐价格
    {
      id: '10',
      category: 'pricing',
      question: '当前的使用限制是什么？',
      answer: '免费用户：每月3张图片。标准用户：每月60张图片。专业用户：每月180张图片，享受优先处理。所有套餐都包含无限存储且无水印。'
    },
    {
      id: '11',
      category: 'pricing',
      question: '生成的图片会有水印吗？',
      answer: '不会！包括免费套餐在内的所有套餐都生成无水印图片。您将获得干净、专业的结果，适用于任何用途。'
    },
    {
      id: '12',
      category: 'pricing',
      question: '如何取消订阅？',
      answer: '您可以随时在设置 > 账单 > 取消订阅中取消。您的高级功能将在计费周期结束前保持有效，之后自动切换到免费套餐。'
    },

    // 使用权限
    {
      id: '13',
      category: 'usage',
      question: '可以商业使用生成的图片吗？',
      answer: '可以！您拥有所有生成图片的完整商业使用权。可用于商业、社交媒体、营销或任何商业目的。只需确保您上传的原始图片没有版权问题。'
    },
    {
      id: '14',
      category: 'usage',
      question: '图片质量和分辨率如何？',
      answer: '所有图片都以高质量生成。免费用户获得1024x1024像素，标准用户最高1536x1536像素，专业用户最高2048x2048像素分辨率。'
    },

    // 故障排除
    {
      id: '15',
      category: 'troubleshooting',
      question: '图片生成失败了怎么办？',
      answer: '常见解决方案：1）检查网络连接，2）确保图片小于5MB且内容合适，3）尝试不同风格或降低强度，4）清除浏览器缓存重试。问题持续请联系客服。'
    },
    {
      id: '16',
      category: 'troubleshooting',
      question: '为什么生成时间比平时长？',
      answer: '生成通常需要15-30秒。高峰期可能出现延迟。专业用户享有优先处理获得更快结果。如果超过2分钟，请刷新页面重试。'
    },

    // 隐私安全
    {
      id: '17',
      category: 'privacy',
      question: '我的数据安全和隐私吗？',
      answer: '绝对安全。我们使用企业级加密，不会永久存储上传的图片，除非您选择保存。生成的图片仅保存在您的个人画廊中。请查看我们的隐私政策了解完整详情。'
    },
    {
      id: '18',
      category: 'privacy',
      question: '你们会用我的图片训练AI模型吗？',
      answer: '不会，我们不会使用您上传或生成的图片来训练AI模型。您的内容保持私密，仅用于您的图片生成请求。'
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
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
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