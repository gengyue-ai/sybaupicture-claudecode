'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, HelpCircle, BookOpen, Zap, Shield, Settings, CreditCard, ImageIcon, ChevronDown, ChevronRight } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How does the AI image generator work?',
    answer: 'Our AI uses advanced machine learning models inspired by Gen Z culture and the Sybau philosophy - Stay Young, Beautiful and Unique. Simply upload an image or enter text, select your preferred style, and our AI will transform it into a viral-worthy creative piece in seconds.',
    category: 'getting-started'
  },
  {
    id: '2',
    question: 'What image formats are supported?',
    answer: 'We support all major image formats including JPG, PNG, GIF, and WebP. For best results, we recommend uploading high-quality images with good lighting and clear subjects.',
    category: 'getting-started'
  },
  {
    id: '3',
    question: 'How many images can I generate?',
    answer: 'Free users can generate 3 images per month. Standard users get 50 images per month, and PRO users get 200 images per month with priority processing.',
    category: 'pricing'
  },
  {
    id: '4',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription anytime from your account settings. Go to Settings > Billing > Cancel Subscription. Your premium features will remain active until the end of your billing period.',
    category: 'pricing'
  },
  {
    id: '5',
    question: 'Can I use generated images commercially?',
    answer: 'Yes! All images generated with Sybau Picture can be used for commercial purposes. You retain full rights to your creations. However, please ensure your original uploaded images don\'t infringe on copyrights.',
    category: 'usage'
  },
  {
    id: '6',
    question: 'My image generation failed. What should I do?',
    answer: 'If generation fails, try: 1) Check your internet connection, 2) Ensure your image meets our guidelines (under 10MB, appropriate content), 3) Try a different image or lower intensity setting. If issues persist, contact support.',
    category: 'troubleshooting'
  },
  {
    id: '7',
    question: 'How do I download my generated images?',
    answer: 'After your image is generated, click the download button to save it to your device. Premium users can download in multiple resolutions including HD and 4K.',
    category: 'getting-started'
  },
  {
    id: '8',
    question: 'Is my data safe and private?',
    answer: 'Absolutely. We use enterprise-grade encryption and don\'t store your uploaded images permanently. Generated images are only saved if you choose to add them to your gallery. Read our Privacy Policy for full details.',
    category: 'privacy'
  },
  {
    id: '9',
    question: 'Do you provide API access?',
    answer: 'Currently, we do not provide API access. We focus on delivering a comprehensive web-based service experience. For batch processing needs, we recommend using our web interface.',
    category: 'technical'
  }
]

const categories = [
  { id: 'all', name: 'All Topics', icon: BookOpen },
  { id: 'getting-started', name: 'Getting Started', icon: Zap },
  { id: 'pricing', name: 'Pricing & Billing', icon: CreditCard },
  { id: 'usage', name: 'Usage & Rights', icon: ImageIcon },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: Settings },
  { id: 'privacy', name: 'Privacy & Security', icon: Shield },
  { id: 'technical', name: 'Technical Support', icon: Settings }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

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
      <div className="container py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4">Help & Support</Badge>
          <h1 className="text-4xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions about Sybau Picture.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles..."
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
                  Topics
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
                  Frequently Asked Questions
                </h2>
                <Badge variant="outline">
                  {filteredFAQs.length} questions
                </Badge>
              </div>

              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <CardTitle className="mb-2">No results found</CardTitle>
                    <CardDescription>
                      Try adjusting your search or browse by category
                    </CardDescription>
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
