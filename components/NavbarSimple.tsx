'use client'

import Link from 'next/link'

// 简化版导航栏，不使用任何复杂的hooks
export default function NavbarSimple() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#1D4ED8', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#navLogoGradient)" />
                <path 
                  d="M6 20 C6 22, 8 24, 10 24 L12 24 C14 24, 16 22, 16 20 C16 18, 14 16, 12 16 L10 16 C8 16, 6 14, 6 12 C6 10, 8 8, 10 8 L12 8 C14 8, 16 10, 16 12" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  fill="none"
                />
                <path 
                  d="M20 8 L20 24 M20 8 L24 8 C26 8, 28 10, 28 12 L28 14 C28 16, 26 18, 24 18 L20 18" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  fill="none"
                />
              </svg>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Sybau Picture
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-base text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Home
            </Link>
            <Link href="/gallery" className="text-base text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Gallery
            </Link>
            <Link href="/pricing" className="text-base text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/help" className="text-base text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Help
            </Link>
          </div>

          {/* Right side - simplified */}
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-500 hover:text-gray-700 hidden md:flex px-3 py-2">
              中文
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    </nav>
  )
}