'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download, Heart, Search, Filter, Grid3X3, List, ArrowLeft, Loader2, Trash2, Eye, Share2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface GeneratedImage {
  id: string
  originalImage: string
  processedImage: string
  style: string
  intensity: number
  createdAt: string
  metadata?: {
    processingTime?: number
    fileSize?: number
  }
}

export default function HistoryPage() {
  const sessionData = useSession()
  const { data: session, status } = sessionData || { data: null, status: 'loading' }
  const router = useRouter()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  // 🚨 修复：只有在明确未认证时才重定向，避免loading状态误判
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('⚠️ 用户未认证，重定向到登录页面')
      router.push('/auth/signin')
      return
    }
    
    // loading状态不做任何操作，等待认证完成
    if (status === 'loading') {
      console.log('🔄 正在检查用户认证状态...')
    }
  }, [status, router])

  // 加载用户历史记录
  useEffect(() => {
    if (session?.user) {
      fetchUserHistory()
    }
  }, [session])

  const fetchUserHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/history')
      const data = await response.json()
      
      if (response.ok) {
        setImages(data.images || [])
      } else {
        console.error('Failed to fetch history:', data.error)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (imageUrl: string, imageId: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sybau-meme-${imageId}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/user/history/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId))
      } else {
        console.error('Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  // 过滤和排序图片
  const filteredImages = images
    .filter(image => {
      const matchesSearch = searchQuery === '' || 
        image.style.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStyle = selectedStyle === 'all' || image.style === selectedStyle
      return matchesSearch && matchesStyle
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
    })

  const styles = ['all', ...Array.from(new Set(images.map(img => img.style)))]

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // 将重定向到登录页面
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">My Gallery</span>
            </div>
          </div>

          <Link href="/generator">
            <Button>Create New</Button>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>

            {/* Style Filter */}
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="flex h-10 w-full md:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {styles.map(style => (
                <option key={style} value={style}>
                  {style === 'all' ? 'All Styles' : style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="flex h-10 w-full md:w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Images</p>
                  <p className="text-2xl font-bold">{images.length}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Grid3X3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">
                    {images.filter(img => 
                      new Date(img.createdAt).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Favorite Style</p>
                  <p className="text-2xl font-bold">
                    {images.length > 0 ? 
                      images.reduce((acc, img) => {
                        acc[img.style] = (acc[img.style] || 0) + 1
                        return acc
                      }, {} as Record<string, number>) &&
                      Object.entries(images.reduce((acc, img) => {
                        acc[img.style] = (acc[img.style] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)).sort(([,a], [,b]) => b - a)[0]?.[0] || '-'
                      : '-'
                    }
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Images Grid/List */}
        {filteredImages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <Grid3X3 className="h-16 w-16 mx-auto text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">No images found</CardTitle>
              <CardDescription className="mb-4">
                {images.length === 0 
                  ? "You haven't created any memes yet. Start creating!"
                  : "No images match your current filters."
                }
              </CardDescription>
              {images.length === 0 && (
                <Link href="/generator">
                  <Button>Create Your First Meme</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}>
            {filteredImages.map((image) => (
              <Card key={image.id} className="group overflow-hidden">
                {viewMode === 'grid' ? (
                  <>
                    <div className="relative aspect-square">
                      <Image
                        src={image.processedImage}
                        alt={`Generated meme in ${image.style} style`}
                        fill
                        className="object-cover transition-transform group-"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute top-2 right-2 opacity-0 transition-opacity">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(image.processedImage, image.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{image.style}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(image.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Intensity: {image.intensity}%
                        </span>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={image.processedImage}
                          alt={`Generated meme in ${image.style} style`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="secondary">{image.style}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Intensity: {image.intensity}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(image.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(image.processedImage, image.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 