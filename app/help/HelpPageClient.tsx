'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, HelpCircle, BookOpen, Zap, Shield, Settings, CreditCard, ImageIcon, ChevronDown, ChevronRight, Palette, Archive } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: '1',
    question: 'How does the AI image generator work?',
    answer: 'Our AI uses advanced machine learning models inspired by Gen Z culture and the Sybau philosophy - Stay Young, Beautiful and Unique. Choose between Text-to-Image mode (enter a description) or Image-to-Image mode (upload and transform), select your style, and get professional results in seconds.',
    category: 'getting-started'
  },
  {
    id: '2',
    question: 'What\'s the difference between Text-to-Image and Image-to-Image modes?',
    answer: 'Text-to-Image creates completely new images from your written description. Image-to-Image transforms your uploaded photos using AI - perfect for editing, style changes, or enhancements. Both modes support our 4 professional styles.',
    category: 'getting-started'
  },
  {
    id: '3',
    question: 'What image formats are supported?',
    answer: 'We support JPG, PNG, and WebP formats. Images should be under 5MB for optimal processing. Resolution between 512x512 and 2048x2048 pixels works best.',
    category: 'getting-started'
  },
  {
    id: '4',
    question: 'How do I download my generated images?',
    answer: 'Click the download button after generation to save images to your device. All images are saved in high-quality JPG format. You can also access them later in "My Assets".',
    category: 'getting-started'
  },

  // Templates & Modes
  {
    id: '5',
    question: 'What are Templates and how do I use them?',
    answer: 'Templates are pre-configured AI setups for specific tasks like watermark removal, body optimization, or background replacement. Click the template library button to browse 14 professional templates across 3 categories: Life Enhancement, Business Creation, and Creative Conversion.',
    category: 'templates'
  },
  {
    id: '6',
    question: 'Which templates are available for free users?',
    answer: 'Free users get access to 3 essential templates: Smart Watermark Removal, Body Optimization, and Tourist Removal. Standard users get 5 templates, while Pro users unlock all 14 professional templates.',
    category: 'templates'
  },
  {
    id: '7',
    question: 'What are the different AI styles available?',
    answer: 'We offer 4 professional styles: Classic (balanced aesthetic), Professional (refined business-ready), Exaggerated (bold and expressive), and Creative (imaginative and artistic). Free users get Classic and Professional, while paid users access all styles.',
    category: 'templates'
  },

  // My Assets
  {
    id: '8',
    question: 'How do I manage my generated images?',
    answer: 'Visit "My Assets" in your profile to view all generated images, organized by date. You can view, download, or delete images from your personal gallery. Images are automatically saved when you generate them.',
    category: 'assets'
  },
  {
    id: '9',
    question: 'How long are my images stored?',
    answer: 'Your generated images are stored permanently in your account unless you delete them. You have unlimited storage for your creations and can access them anytime from "My Assets".',
    category: 'assets'
  },

  // Pricing & Plans
  {
    id: '10',
    question: 'What are the current usage limits?',
    answer: 'Free users: 3 images per month. Standard users: 60 images per month. Pro users: 180 images per month with priority processing. All plans include unlimited storage and no watermarks.',
    category: 'pricing'
  },
  {
    id: '11',
    question: 'Do you add watermarks to generated images?',
    answer: 'No! All plans, including the free tier, generate images without watermarks. You get clean, professional results ready for any use case.',
    category: 'pricing'
  },
  {
    id: '12',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from Settings > Billing > Cancel Subscription. Your premium features remain active until the end of your billing period, then you\'ll automatically switch to the free plan.',
    category: 'pricing'
  },

  // Usage & Rights
  {
    id: '13',
    question: 'Can I use generated images commercially?',
    answer: 'Yes! You retain full commercial rights to all generated images. Use them for business, social media, marketing, or any commercial purpose. Just ensure your original uploaded images don\'t infringe on copyrights.',
    category: 'usage'
  },
  {
    id: '14',
    question: 'What\'s the image quality and resolution?',
    answer: 'All images are generated in high quality. Free users get 1024x1024px, Standard users get up to 1536x1536px, and Pro users get up to 2048x2048px resolution.',
    category: 'usage'
  },

  // Troubleshooting
  {
    id: '15',
    question: 'My image generation failed. What should I do?',
    answer: 'Common solutions: 1) Check your internet connection, 2) Ensure image is under 5MB and appropriate content, 3) Try a different style or lower intensity, 4) Clear browser cache and retry. Contact support if issues persist.',
    category: 'troubleshooting'
  },
  {
    id: '16',
    question: 'Why is generation taking longer than usual?',
    answer: 'Generation typically takes 15-30 seconds. Delays can occur during high traffic periods. Pro users get priority processing for faster results. If it takes over 2 minutes, please refresh and try again.',
    category: 'troubleshooting'
  },

  // Privacy & Security
  {
    id: '17',
    question: 'Is my data safe and private?',
    answer: 'Absolutely. We use enterprise-grade encryption and don\'t store uploaded images permanently unless you choose to save them. Generated images are only kept in your personal gallery. Read our Privacy Policy for complete details.',
    category: 'privacy'
  },
  {
    id: '18',
    question: 'Do you train AI models on my images?',
    answer: 'No, we do not use your uploaded or generated images to train our AI models. Your content remains private and is used solely for your image generation requests.',
    category: 'privacy'
  }
]

const categories = [
  { id: 'all', name: 'All Topics', icon: BookOpen },
  { id: 'getting-started', name: 'Getting Started', icon: Zap },
  { id: 'templates', name: 'Templates & Modes', icon: Palette },
  { id: 'assets', name: 'My Assets', icon: Archive },
  { id: 'pricing', name: 'Pricing & Plans', icon: CreditCard },
  { id: 'usage', name: 'Usage & Rights', icon: ImageIcon },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: Settings },
  { id: 'privacy', name: 'Privacy & Security', icon: Shield }
]

export default function HelpPageClient() {
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

        {/* Call-to-Action Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to Create Amazing AI Images?
              </h3>
              <p className="text-gray-600 mb-6">
                🎉 All 14 professional templates are FREE! Experience FLUX Pro powered generation with 4 AI styles. Start creating in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  onClick={() => window.location.href = '/'}
                >
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Start Creating Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = '/gallery'}
                >
                  <Palette className="mr-2 h-5 w-5" />
                  View Examples
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}