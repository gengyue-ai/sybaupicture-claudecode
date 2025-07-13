'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Mail, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">Get in touch with our team</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="font-semibold mb-4">Thank you for your interest in Sybau Picture</h3>
                <p className="text-gray-600">We appreciate your feedback and inquiries about our AI-powered image generation platform.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-gray-600 text-sm mb-2">Get help with technical issues</p>
                  <a href="mailto:support@sybaupicture.com" className="text-blue-600 hover:text-blue-800">
                    support@sybaupicture.com
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">General Inquiries</h4>
                  <p className="text-gray-600 text-sm mb-2">Questions about our platform</p>
                  <a href="mailto:hello@sybaupicture.com" className="text-green-600 hover:text-green-800">
                    hello@sybaupicture.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
