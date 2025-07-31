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

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Contact Form</h4>
                <p className="text-gray-600 mb-4">Send us a message and we'll get back to you within 24 hours</p>
                
                <form className="max-w-md mx-auto space-y-4">
                  <div>
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required 
                    />
                  </div>
                  <div>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select inquiry type</option>
                      <option value="technical">Technical Support</option>
                      <option value="general">General Questions</option>
                      <option value="billing">Billing & Subscriptions</option>
                      <option value="feature">Feature Requests</option>
                    </select>
                  </div>
                  <div>
                    <textarea 
                      placeholder="Your message" 
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
