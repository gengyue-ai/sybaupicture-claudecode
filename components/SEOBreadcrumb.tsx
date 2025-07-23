'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

export default function SEOBreadcrumb() {
  const pathname = usePathname()
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ]
    
    let currentPath = ''
    
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      
      // 跳过语言路径
      if (path === 'zh') {
        breadcrumbs[0] = { label: '首页', href: '/zh' }
        return
      }
      
      const isLast = index === paths.length - 1
      const label = getPageLabel(path, pathname.startsWith('/zh'))
      
      if (label) {
        breadcrumbs.push({
          label,
          href: currentPath
        })
      }
    })
    
    return breadcrumbs
  }
  
  const getPageLabel = (path: string, isChinese: boolean): string => {
    const labels: Record<string, { en: string; zh: string }> = {
      'gallery': { en: 'Gallery', zh: '画廊' },
      'pricing': { en: 'Pricing', zh: '定价' },
      'help': { en: 'Help', zh: '帮助' },
      'support': { en: 'Support', zh: '支持' },
      'contact': { en: 'Contact', zh: '联系' },
      'privacy': { en: 'Privacy', zh: '隐私政策' },
      'terms': { en: 'Terms', zh: '服务条款' },
      'profile': { en: 'Profile', zh: '个人资料' },
      'history': { en: 'History', zh: '历史记录' }
    }
    
    return labels[path] ? labels[path][isChinese ? 'zh' : 'en'] : ''
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  if (breadcrumbs.length <= 1) return null
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center space-x-2 text-sm text-muted-foreground mb-4 px-4 py-2"
    >
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
          {index === 0 && <Home className="h-4 w-4 mr-1" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link 
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
      
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              "item": `https://sybaupicture.com${item.href}`
            }))
          })
        }}
      />
    </nav>
  )
}