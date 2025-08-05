'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentLanguageFromPath } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Image, 
  Download, 
  Eye, 
  Heart, 
  Calendar, 
  Filter,
  Grid3X3,
  List,
  Search,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

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
  intensity: number
  viewCount: number
  downloadCount: number
  shareCount: number
  createdAt: string
  metadata?: string
}

// 国际化文本
const i18n = {
  zh: {
    title: '我的资产',
    description: '管理您生成的所有AI图片',
    stats: '统计概览',
    totalImages: '总图片数',
    thisMonth: '本月生成',
    totalViews: '总查看数',
    totalDownloads: '总下载数',
    favorites: '收藏数',
    filters: '筛选',
    searchPlaceholder: '搜索图片...',
    allStyles: '所有风格',
    sortBy: '排序方式',
    latest: '最新',
    oldest: '最旧',
    mostViewed: '最多查看',
    mostDownloaded: '最多下载',
    viewMode: '查看模式',
    gridView: '网格视图',
    listView: '列表视图',
    noImages: '暂无图片',
    noImagesDesc: '您还没有生成任何图片，开始创作吧！',
    startCreating: '开始创作',
    loading: '加载中...',
    loadMore: '加载更多',
    style: '风格',
    intensity: '强度',
    createdAt: '创建时间',
    views: '查看',
    downloads: '下载',
    shares: '分享'
  },
  en: {
    title: 'My Assets',
    description: 'Manage all your generated AI images',
    stats: 'Statistics Overview',
    totalImages: 'Total Images',
    thisMonth: 'This Month',
    totalViews: 'Total Views',
    totalDownloads: 'Total Downloads',
    favorites: 'Favorites',
    filters: 'Filters',
    searchPlaceholder: 'Search images...',
    allStyles: 'All Styles',
    sortBy: 'Sort By',
    latest: 'Latest',
    oldest: 'Oldest',
    mostViewed: 'Most Viewed',
    mostDownloaded: 'Most Downloaded',
    viewMode: 'View Mode',
    gridView: 'Grid View',
    listView: 'List View',
    noImages: 'No Images',
    noImagesDesc: 'You haven\'t generated any images yet. Start creating!',
    startCreating: 'Start Creating',
    loading: 'Loading...',
    loadMore: 'Load More',
    style: 'Style',
    intensity: 'Intensity',
    createdAt: 'Created At',
    views: 'Views',
    downloads: 'Downloads',
    shares: 'Shares'
  }
}

export default function AssetsPageClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const currentLang = getCurrentLanguageFromPath(pathname || '/')
  const t = i18n[currentLang]

  const [stats, setStats] = useState<ImageStats | null>(null)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 重定向未登录用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(currentLang === 'zh' ? '/zh/auth/signin' : '/auth/signin')
    }
  }, [status, router, currentLang])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserImages(true)
    }
  }, [status, selectedStyle, sortBy])

  const fetchUserImages = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(1)
      } else {
        setLoadingMore(true)
      }

      const currentPage = reset ? 1 : page
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        style: selectedStyle === 'all' ? '' : selectedStyle,
        sort: sortBy,
        search: searchTerm
      })

      const response = await fetch(`/api/user/images?${params}`)
      
      if (!response.ok) {
        console.error('获取用户图片失败:', {
          status: response.status,
          statusText: response.statusText,
          params: params.toString()
        })
        throw new Error('Failed to fetch images')
      }

      const data = await response.json()
      
      console.log('📊 用户图片数据:', {
        success: data.success,
        imagesCount: data.images?.length,
        hasMore: data.hasMore,
        currentPage,
        totalCount: data.totalCount
      })
      
      if (data.success) {
        if (reset) {
          setImages(data.data.images)
          setStats(data.data.stats)
        } else {
          setImages(prev => [...prev, ...data.data.images])
        }
        setHasMore(data.data.hasMore)
        if (!reset) {
          setPage(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Error fetching user images:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUserImages(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    // 延迟搜索
    setTimeout(() => fetchUserImages(true), 500)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US')
  }

  const getStyleBadgeColor = (style: string) => {
    const colors = {
      classic: 'bg-blue-100 text-blue-800',
      exaggerated: 'bg-purple-100 text-purple-800',
      minimal: 'bg-green-100 text-green-800'
    }
    return colors[style as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.description}</p>
      </div>

      {/* 统计概览 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalImage}</p>
              <p className="text-sm text-gray-600">{t.totalImages}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.monthlyImage}</p>
              <p className="text-sm text-gray-600">{t.thisMonth}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
              <p className="text-sm text-gray-600">{t.totalViews}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.totalDownloads}</p>
              <p className="text-sm text-gray-600">{t.totalDownloads}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.favoriteImage}</p>
              <p className="text-sm text-gray-600">{t.favorites}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 筛选和搜索 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* 搜索 */}
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 风格筛选 */}
              <select 
                value={selectedStyle} 
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t.allStyles}</option>
                <option value="classic">Classic</option>
                <option value="exaggerated">Exaggerated</option>
                <option value="minimal">Minimal</option>
              </select>

              {/* 排序 */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">{t.latest}</option>
                <option value="oldest">{t.oldest}</option>
                <option value="most_viewed">{t.mostViewed}</option>
                <option value="most_downloaded">{t.mostDownloaded}</option>
              </select>
            </div>

            {/* 视图模式 */}
            <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {/* 图片展示 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t.loading}</span>
        </div>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noImages}</h3>
            <p className="text-gray-600 mb-6">{t.noImagesDesc}</p>
            <Link href={currentLang === 'zh' ? '/zh' : '/'}>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                {t.startCreating}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={image.thumbnailUrl || image.processedUrl}
                      alt={`Generated on ${formatDate(image.createdAt)}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getStyleBadgeColor(image.style)}>
                        {image.style}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{formatDate(image.createdAt)}</span>
                      <span>{t.intensity}: {image.intensity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {image.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {image.downloadCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((image) => (
                <Card key={image.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.thumbnailUrl || image.processedUrl}
                          alt={`Generated on ${formatDate(image.createdAt)}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getStyleBadgeColor(image.style)}>
                            {image.style}
                          </Badge>
                          <span className="text-sm text-gray-500">{formatDate(image.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>{image.viewCount} {t.views}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            <span>{image.downloadCount} {t.downloads}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{t.intensity}: {image.intensity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 加载更多 */}
          {hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="outline"
                className="min-w-32"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  t.loadMore
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}