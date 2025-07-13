'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { Sparkles, Github, Mail, Globe, Star, Rocket, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { generateLocalizedLink } from '@/lib/i18n'

const FOOTER_LINKS = {
  product: [
    { name: 'footer.product.gallery', fallback: 'Gallery', href: '/gallery' },
  ],
  resources: [
    { name: 'footer.resources.help', fallback: 'Help Guide', href: '/help' },
  ],
  company: [
    { name: 'footer.company.privacy', fallback: 'Privacy Policy', href: '/privacy' },
    { name: 'footer.company.terms', fallback: 'Terms of Service', href: '/terms' },
    { name: 'footer.company.contact', fallback: 'Contact Us', href: '/contact' },
  ],
  support: [
    { name: 'footer.support.help', fallback: 'Help Center', href: '/help' },
    { name: 'footer.support.technical', fallback: 'Technical Support', href: '/support' }
  ]
}

const SOCIAL_LINKS = [
  { name: 'GitHub', icon: Github, href: 'https://github.com/gengyue-ai/sybaupicture' },
  { name: 'X', icon: X, href: 'https://x.com/SybauPicture' },
  { name: 'Email', icon: Mail, href: 'mailto:support@sybaupicture.com' }
]

export default function Footer() {
  const { t } = useTranslation('/')
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const pathname = usePathname()

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      alert('请输入有效的邮箱地址')
      return
    }

    setIsSubscribing(true)

    try {
      // 这里可以添加实际的订阅API调用
      console.log('Subscribing email:', email)

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert('订阅成功！感谢您的关注。')
      setEmail('')
    } catch (error) {
      console.error('Subscription error:', error)
      alert('订阅失败，请稍后重试。')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href={generateLocalizedLink('/', pathname)} className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Sybau Picture
                </h3>
                <p className="text-gray-400 text-sm">AI Meme Generator</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t('footer.description', 'The world\'s first AI meme generator platform focused on Sybau style. Making viral content creation accessible to everyone.')}
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.product.title', 'Product')}</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={generateLocalizedLink(link.href, pathname)}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  >
                    {t(link.name, link.fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.resources.title', 'Resources')}</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={generateLocalizedLink(link.href, pathname)}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  >
                    {t(link.name, link.fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.company.title', 'Company')}</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={generateLocalizedLink(link.href, pathname)}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  >
                    {t(link.name, link.fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.support.title', 'Support')}</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={generateLocalizedLink(link.href, pathname)}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  >
                    {t(link.name, link.fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="font-semibold text-white mb-2 flex items-center justify-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              {t('footer.newsletter.title', 'Subscribe to Updates')}
            </h4>
            <p className="text-gray-400 mb-4 text-sm">
              {t('footer.newsletter.description', 'Get latest features and creative inspiration')}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder', 'Enter your email')}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={handleSubscribe} disabled={isSubscribing}>
                <Rocket className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© 2025 Sybau Picture. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <Link href={generateLocalizedLink('/privacy', pathname)} className="text-gray-400 hover:text-purple-400 transition-colors">
                {t('footer.privacy', 'Privacy Policy')}
              </Link>
              <Link href={generateLocalizedLink('/terms', pathname)} className="text-gray-400 hover:text-purple-400 transition-colors">
                {t('footer.terms', 'Terms of Service')}
              </Link>
              <div className="flex items-center text-gray-400">
                <Globe className="w-4 h-4 mr-1" />
                <span>{t('footer.language', 'Language')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
