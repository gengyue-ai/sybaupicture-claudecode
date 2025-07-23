'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles, Image, CreditCard, HelpCircle } from 'lucide-react'

export default function SEOInternalLinks() {
  const pathname = usePathname()
  const isZh = pathname.startsWith('/zh')
  
  const getRelevantLinks = () => {
    const baseLinks = [
      {
        href: isZh ? '/zh/gallery' : '/gallery',
        title: isZh ? 'AI 画廊' : 'AI Gallery',
        description: isZh ? '探索社区创作的精美AI图片' : 'Explore stunning AI-generated images',
        icon: Image,
        priority: 'high'
      },
      {
        href: isZh ? '/zh/pricing' : '/pricing',
        title: isZh ? '定价方案' : 'Pricing Plans',
        description: isZh ? '选择适合您的订阅计划' : 'Choose the perfect plan for you',
        icon: CreditCard,
        priority: 'high'
      },
      {
        href: isZh ? '/zh/help' : '/help',
        title: isZh ? '帮助中心' : 'Help Center',
        description: isZh ? '获取使用指南和常见问题解答' : 'Get help and FAQ answers',
        icon: HelpCircle,
        priority: 'medium'
      },
      {
        href: isZh ? '/zh' : '/',
        title: isZh ? 'AI 图片生成器' : 'AI Image Generator',
        description: isZh ? '使用AI创建独特的Sybau风格图片' : 'Create unique Sybau-style images with AI',
        icon: Sparkles,
        priority: 'high'
      }
    ]
    
    // 过滤掉当前页面
    return baseLinks.filter(link => link.href !== pathname)
  }
  
  const links = getRelevantLinks()
  
  if (links.length === 0) return null
  
  return (
    <section className="mt-12 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isZh ? '探索更多功能' : 'Explore More Features'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.slice(0, 3).map((link) => {
          const Icon = link.icon
          return (
            <Card key={link.href} className="hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <Link href={link.href} className="block">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {link.description}
                      </p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        {isZh ? '了解更多' : 'Learn More'}
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}