import ContactForm from '@/components/ContactForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Sybau Picture | Get in Touch with Our AI Team',
  description: 'Contact Sybau Picture team for support, feedback, or questions about our AI image generator. Send us a message and get a response within 24 hours.',
  keywords: ['contact', 'support', 'customer service', 'AI image generator', 'Sybau Picture', 'help', 'feedback'],
  openGraph: {
    title: 'Contact Us - Sybau Picture',
    description: 'Get in touch with Sybau Picture team for support and questions about our AI image generator.',
    url: 'https://sybaupicture.com/contact',
  },
  alternates: {
    canonical: 'https://sybaupicture.com/contact', // 绝对URL
    languages: {
      'en-US': 'https://sybaupicture.com/contact',
      'zh-CN': 'https://sybaupicture.com/zh/contact',
      'x-default': 'https://sybaupicture.com/contact'
    },
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">Get in touch with our team</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-semibold mb-4">Thank you for your interest in Sybau Picture</h3>
            <p className="text-gray-600">We appreciate your feedback and inquiries about our AI-powered image generation platform.</p>
          </div>
          
          <ContactForm locale="en" />
        </div>
      </div>
    </div>
  )
}
