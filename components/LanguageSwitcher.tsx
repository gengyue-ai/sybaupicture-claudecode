'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu'
import { 
  SUPPORTED_LANGUAGES, 
  SupportedLanguage, 
  DEFAULT_LANGUAGE,
  extractLanguageFromPath,
  generateLanguageUrl,
  getLanguageInfo
} from '@/lib/i18n'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

export default function LanguageSwitcher({ 
  className = '', 
  variant = 'ghost',
  size = 'default'
}: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const [isOpen, setIsOpen] = useState(false)

  // 从URL中提取当前语言
  useEffect(() => {
    const { language } = extractLanguageFromPath(pathname)
    setCurrentLang(language)
  }, [pathname])

  const currentLangInfo = getLanguageInfo(currentLang)

  const handleLanguageChange = (targetLang: SupportedLanguage) => {
    if (targetLang === currentLang) return
    
    const newUrl = generateLanguageUrl(pathname, targetLang)
    router.push(newUrl)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`gap-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLangInfo?.native || 'Language'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Choose Language
        </div>
        
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between px-2 py-2 cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{lang.native}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
            
            {currentLang === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 