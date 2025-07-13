'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileText, Shield, Users, Gavel, AlertTriangle, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  const termsSections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      content: `By accessing and using Sybau Picture, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

These Terms of Service ("Terms") govern your use of our website located at sybaupicture.com (the "Service") operated by Sybau Picture ("us", "we", or "our").

Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.`
    },
    {
      id: 'use-license',
      title: 'Use License',
      icon: Shield,
      content: `Permission is granted to temporarily download one copy of the materials on Sybau Picture's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

• Modify or copy the materials
• Use the materials for any commercial purpose or for any public display (commercial or non-commercial)
• Attempt to decompile or reverse engineer any software contained on the website
• Remove any copyright or other proprietary notations from the materials`
    },
    {
      id: 'user-content',
      title: 'User Content and Generated Images',
      icon: Users,
      content: `You retain ownership of any intellectual property rights that you hold in content you submit, post or display on or through the Service. By submitting content to our Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate and distribute it in any media.

Generated images using our AI service:
• You own the generated images created through our platform
• We reserve the right to use generated images for improving our AI models (anonymized)
• You may use generated images for personal and commercial purposes
• You are responsible for ensuring generated content complies with applicable laws`
    },
    {
      id: 'prohibited-uses',
      title: 'Prohibited Uses',
      icon: AlertTriangle,
      content: `You may not use our Service:

• For any unlawful purpose or to solicit others to perform unlawful acts
• To violate any international, federal, provincial or state regulations, rules, laws, or local ordinances
• To infringe upon or violate our intellectual property rights or the intellectual property rights of others
• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
• To submit false or misleading information
• To upload or transmit viruses or any other type of malicious code
• To collect or track the personal information of others
• To spam, phish, pharm, pretext, spider, crawl, or scrape
• For any obscene or immoral purpose
• To interfere with or circumvent the security features of the Service`
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers',
      icon: Gavel,
      content: `The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law, this Company:

• Excludes all representations and warranties relating to this website and its contents
• Excludes all liability for damages arising out of or in connection with your use of this website

AI-Generated Content Disclaimer:
• Generated content is provided "as is" without any guarantees of accuracy or appropriateness
• Users are responsible for reviewing and validating all generated content before use
• We do not guarantee that generated content will be free from errors or suitable for any particular purpose`
    },
    {
      id: 'limitations',
      title: 'Limitations',
      icon: FileText,
      content: `In no event shall Sybau Picture or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Sybau Picture's website, even if Sybau Picture or a Sybau Picture authorized representative has been notified orally or in writing of the possibility of such damage.

Service Limitations:
• Daily generation limits may apply based on your account type
• We reserve the right to modify or discontinue the service at any time
• Temporary service interruptions may occur for maintenance or updates`
    }
  ]

    return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these Terms of Service carefully before using Sybau Picture. These terms govern your use of our AI meme generation platform.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: December 2024
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Quick Overview Card */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <CheckCircle className="w-5 h-5 mr-2" />
                Terms Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ul className="space-y-2">
                <li>• You must be 13 years or older to use our service</li>
                <li>• You own the content you create with our AI generator</li>
                <li>• Use our service responsibly and legally</li>
                <li>• We reserve the right to modify these terms with notice</li>
                <li>• Generated content should be reviewed before public use</li>
              </ul>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-6">
            {termsSections.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={section.id} className=" transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <Icon className="w-6 h-6 mr-3 text-blue-600" />
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
                  {index < termsSections.length - 1 && <Separator className="mx-6" />}
                </Card>
              )
            })}
          </div>

          {/* Contact Information */}
          <Card className="mt-8 bg-blue-900 text-white">
            <CardHeader>
              <CardTitle className="text-white">Questions About These Terms?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-blue-100">
                <p>📧 Email: legal@sybaupicture.com</p>
                <p>📍 Address: Sybau Picture Legal Team</p>
                <p>🌐 Web: Contact form at /contact</p>
              </div>
            </CardContent>
          </Card>
                </div>
      </div>
    </div>
  )
}
