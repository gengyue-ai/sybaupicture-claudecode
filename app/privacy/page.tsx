'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, Eye, Lock, UserCheck, Database, Globe } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  const privacySections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: `We collect information you provide directly to us, such as when you create an account, use our AI generation services, or contact us for support. This includes:
      
• Personal Information: Name, email address, and profile information
• Usage Data: Images you upload, generation history, and preferences
• Technical Data: IP address, browser type, device information, and usage patterns
• Communications: Messages you send to us and feedback you provide`
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: UserCheck,
      content: `We use the information we collect to:
      
• Provide and improve our AI meme generation services
• Process your uploads and generate personalized content
• Maintain and secure your account
• Send you updates about new features and improvements
• Respond to your questions and provide customer support
• Analyze usage patterns to enhance user experience`
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing and Disclosure',
      icon: Globe,
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
      
• With your consent or at your direction
• To comply with legal obligations or valid legal requests
• To protect our rights, property, or safety, or that of our users
• With service providers who assist us in operating our platform
• In connection with a merger, acquisition, or sale of assets`
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      content: `We implement industry-standard security measures to protect your information:
      
• Encryption in transit and at rest
• Regular security audits and monitoring
• Secure data centers with restricted access
• Employee training on privacy and security practices
• Incident response procedures for any security events`
    },
    {
      id: 'your-rights',
      title: 'Your Privacy Rights',
      icon: Shield,
      content: `You have several rights regarding your personal information:
      
• Access: Request a copy of the personal information we hold about you
• Correction: Ask us to correct any inaccurate or incomplete information
• Deletion: Request deletion of your personal information
• Portability: Receive your data in a machine-readable format
• Objection: Object to certain processing of your information
• Withdrawal: Withdraw consent where processing is based on consent`
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: Eye,
      content: `We use cookies and similar technologies to:
      
• Remember your preferences and settings
• Understand how you use our platform
• Improve our services and user experience
• Provide personalized content and features
      
You can control cookies through your browser settings, but disabling them may affect some platform functionality.`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use Sybau Picture.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: December 2024
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Quick Summary Card */}
          <Card className="mb-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <Eye className="w-5 h-5 mr-2" />
                Privacy at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-purple-700">
              <ul className="space-y-2">
                <li>• We only collect information necessary to provide our services</li>
                <li>• Your images and creations are processed securely and privately</li>
                <li>• We never sell your personal information to third parties</li>
                <li>• You have full control over your data and can delete it anytime</li>
                <li>• We use industry-standard encryption and security measures</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
          <div className="space-y-6">
            {privacySections.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={section.id} className=" transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <Icon className="w-6 h-6 mr-3 text-purple-600" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-gray max-w-none">
                      {section.content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-3 text-gray-700 leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                  {index < privacySections.length - 1 && <Separator className="mx-6" />}
                </Card>
              )
            })}
          </div>

          {/* Contact Information */}
          <Card className="mt-8 bg-gray-900 text-white">
            <CardHeader>
              <CardTitle className="text-white">Questions About Privacy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or how we handle your information, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p>📧 Email: privacy@sybaupicture.com</p>
                <p>📍 Address: Sybau Picture Privacy Team</p>
                <p>🌐 Web: Contact form at /contact</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
} 