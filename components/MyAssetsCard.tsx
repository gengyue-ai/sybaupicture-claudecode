'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Eye, Download, Heart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ImageStats {
  totalImage: number
  monthlyImage: number
  totalViews: number
  totalDownloads: number
  favoriteImage: number
}

interface GeneratedImage {
  id: string
  originalUrl: string
  processedUrl: string
  thumbnailUrl: string | null
  style: string
  createdAt: string
}

interface MyAssetsCardProps {
  className?: string
}

export function MyAssetsCard({ className = '' }: MyAssetsCardProps) {
  const pathname = usePathname()
  const isZh = pathname?.startsWith('/zh')
  
  const [stats, setStats] = useState<ImageStats | null>(null)
  const [recentImage, setRecentImage] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)

  // 国际化文本
  const t = {
    zh: {
      title: '我的生成图片',
      description: '您的AI图像创作画廊',
      totalImage: '总图片数',
      thisMonth: '本月生成',
      favorites: '收藏',
      viewAll: '查看全部图片',
      noImage: '暂无生成图片',
      startCreating: '开始创作',
      loading: '加载中...'
    },
    en: {
      title: 'My Generated Image', 
      description: 'Your AI image creation gallery',
      totalImage: 'Total Image',
      thisMonth: 'This Month',
      favorites: 'Favorites',
      viewAll: 'View All Image',
      noImage: 'No images generated yet',
      startCreating: 'Start Creating',
      loading: 'Loading...'
    }
  }

  const text = t[isZh ? 'zh' : 'en']

  useEffect(() => {
    fetchUserImage()
  }, [])

  const fetchUserImage = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/images?limit=4&recent=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }

      const data = await response.json()
      
      if (data.success) {
        setStats(data.data.stats)
        setRecentImage(data.data.images)
      }
    } catch (error) {
      console.error('Error fetching user images:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Image className="w-6 h-6 mr-2" />
            {text.title}
          </CardTitle>
          <CardDescription>{text.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">{text.loading}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalImage === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Image className="w-6 h-6 mr-2" />
            {text.title}
          </CardTitle>
          <CardDescription>{text.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">{text.noImage}</p>
            <Link href={isZh ? '/zh' : '/'}>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                {text.startCreating}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Image className="w-6 h-6 mr-2" />
          {text.title}
        </CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 统计概览 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.totalImage}</p>
            <p className="text-sm text-blue-600">{text.totalImage}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.monthlyImage}</p>
            <p className="text-sm text-green-600">{text.thisMonth}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.favoriteImage}</p>
            <p className="text-sm text-purple-600">{text.favorites}</p>
          </div>
        </div>

        {/* 最近图片预览 */}
        {recentImage.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-2">
              {recentImage.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-md transition-shadow"
                >
                  <img
                    src={image.thumbnailUrl || image.processedUrl}
                    alt={`Generated on ${new Date(image.createdAt).toLocaleDateString()}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 查看全部按钮 */}
        <Link href={isZh ? '/zh/profile/assets' : '/profile/assets'}>
          <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50">
            {text.viewAll}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}