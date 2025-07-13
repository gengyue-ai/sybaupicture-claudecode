import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database not configured'
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'newest' // newest, oldest, popular, trending
    const style = searchParams.get('style') || 'all'
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}

    // 如果有搜索词，添加搜索条件
    if (search) {
      where.OR = [
        { prompt: { contains: search, mode: 'insensitive' } },
        { style: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 如果有风格筛选，添加风格条件
    if (style !== 'all') {
      where.style = style
    }

    // 构建排序条件
    let orderBy: any = {}
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'popular':
        orderBy = { viewCount: 'desc' }
        break
      case 'trending':
        orderBy = [
          { shareCount: 'desc' },
          { viewCount: 'desc' },
          { createdAt: 'desc' }
        ]
        break
      default: // newest
        orderBy = { createdAt: 'desc' }
    }

    // 获取图片数据
    const [images, totalCount] = await Promise.all([
      prisma.generatedImage.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },

        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.generatedImage.count({ where }),
    ])

    // 格式化数据
    const formattedImages = images.map((image: any) => ({
      id: image.id,
      processedImage: image.processedUrl || image.imageUrl || '/placeholder-image.jpg',
      originalUrl: image.originalUrl,
      thumbnailUrl: image.thumbnailUrl,
      style: image.style,
      intensity: image.intensity,
      createdAt: image.createdAt,
      user: image.user ? {
        id: image.user.id,
        name: image.user.name,
        image: image.user.image,
      } : {
        id: 'anonymous',
        name: 'Anonymous User',
        image: null,
      },
      stats: {
        views: image.viewCount || 0,
        likes: image.shareCount || 0,
        downloads: image.downloadCount || 0,
      },
      isLiked: false,
    }))

    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        images: formattedImages,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
    })
  } catch (error) {
    console.error('获取画廊图片失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取画廊图片失败'
      },
      { status: 500 }
    )
  }
}
