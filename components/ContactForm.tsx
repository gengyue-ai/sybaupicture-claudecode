'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface ContactFormProps {
  locale?: 'en' | 'zh'
}

export default function ContactForm({ locale = 'en' }: ContactFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    inquiryType: '',
    message: ''
  })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isZh = locale === 'zh'

  const inquiryTypes = {
    en: [
      { value: 'technical', label: 'Technical Support' },
      { value: 'general', label: 'General Questions' },
      { value: 'billing', label: 'Billing & Subscriptions' },
      { value: 'feature', label: 'Feature Requests' }
    ],
    zh: [
      { value: 'technical', label: '技术支持' },
      { value: 'general', label: '一般问题' },
      { value: 'billing', label: '账单和订阅' },
      { value: 'feature', label: '功能建议' }
    ]
  }

  const text = {
    en: {
      title: 'Contact Form',
      description: 'Send us a message and we\'ll get back to you within 24 hours',
      emailPlaceholder: 'Your email address',
      selectInquiry: 'Select inquiry type',
      messagePlaceholder: 'Your message',
      sendButton: 'Send Message',
      sending: 'Sending...',
      successTitle: 'Message Sent Successfully!',
      successMessage: 'Thank you for contacting us. We\'ll get back to you within 24 hours.',
      errorTitle: 'Failed to Send Message',
      tryAgain: 'Try Again',
      backToForm: 'Send Another Message',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      messageTooShort: 'Message must be at least 10 characters',
      messageTooLong: 'Message must be less than 2000 characters',
    },
    zh: {
      title: '联系表单',
      description: '发送消息给我们，我们会在24小时内回复您',
      emailPlaceholder: '您的邮箱地址',
      selectInquiry: '选择咨询类型',
      messagePlaceholder: '您的留言',
      sendButton: '发送消息',
      sending: '发送中...',
      successTitle: '消息发送成功！',
      successMessage: '感谢您的联系。我们会在24小时内回复您。',
      errorTitle: '消息发送失败',
      tryAgain: '重试',
      backToForm: '发送另一条消息',
      required: '此字段为必填项',
      invalidEmail: '请输入有效的邮箱地址',
      messageTooShort: '留言至少需要10个字符',
      messageTooLong: '留言不能超过2000个字符',
    }
  }

  const currentText = text[locale]

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = currentText.required
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = currentText.invalidEmail
    }
    
    if (!formData.inquiryType) {
      errors.inquiryType = currentText.required
    }
    
    if (!formData.message) {
      errors.message = currentText.required
    } else if (formData.message.length < 10) {
      errors.message = currentText.messageTooShort
    } else if (formData.message.length > 2000) {
      errors.message = currentText.messageTooLong
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          locale
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }

      if (result.success) {
        setSubmitStatus('success')
        setFormData({ email: '', inquiryType: '', message: '' })
        setFieldErrors({})
      } else {
        throw new Error(result.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const resetForm = () => {
    setSubmitStatus('idle')
    setErrorMessage('')
    setFieldErrors({})
  }

  if (submitStatus === 'success') {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">{currentText.successTitle}</h3>
            <p className="text-gray-600 mb-6">{currentText.successMessage}</p>
            <Button onClick={resetForm} variant="outline">
              {currentText.backToForm}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (submitStatus === 'error') {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">{currentText.errorTitle}</h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="space-x-4">
              <Button onClick={resetForm} variant="outline">
                {currentText.tryAgain}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
          <h4 className="font-semibold mb-2">{currentText.title}</h4>
          <p className="text-gray-600">{currentText.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div>
            <input 
              type="email" 
              placeholder={currentText.emailPlaceholder}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitStatus === 'loading'}
              required 
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <select 
              value={formData.inquiryType}
              onChange={(e) => handleInputChange('inquiryType', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                fieldErrors.inquiryType ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitStatus === 'loading'}
              required
            >
              <option value="">{currentText.selectInquiry}</option>
              {inquiryTypes[locale].map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {fieldErrors.inquiryType && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.inquiryType}</p>
            )}
          </div>

          <div>
            <textarea 
              placeholder={currentText.messagePlaceholder}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical ${
                fieldErrors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitStatus === 'loading'}
              required
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.message ? (
                <p className="text-red-500 text-sm">{fieldErrors.message}</p>
              ) : (
                <div></div>
              )}
              <p className="text-gray-400 text-sm">{formData.message.length}/2000</p>
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full"
            disabled={submitStatus === 'loading'}
          >
            {submitStatus === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {currentText.sending}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {currentText.sendButton}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}