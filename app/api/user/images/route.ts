import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createPrismaClient } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 🎯 创建独立的数据库连接，避免prepared statement冲突
    const prisma = createPrismaClient()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit
    const style = searchParams.get('style') || ''
    const sort = searchParams.get('sort') || 'latest'
    const search = searchParams.get('search') || ''

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 构建查询条件
    const where: any = { userId: user.id }
    
    // 添加风格筛选
    if (style && style !== 'all') {
      where.style = style
    }
    
    // 添加搜索条件
    if (search) {
      where.OR = [
        { style: { contains: search, mode: 'insensitive' } },
        { metadata: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // 构建排序条件
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'most_viewed':
        orderBy = { viewCount: 'desc' }
        break
      case 'most_downloaded':
        orderBy = { downloadCount: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // 获取用户生成的图片
    const images = await prisma.generatedImage.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        id: true,
        originalUrl: true,
        processedUrl: true,
        thumbnailUrl: true,
        style: true,
        intensity: true,
        viewCount: true,
        downloadCount: true,
        createdAt: true,
        metadata: true,
      }
    })

    // 获取统计信息 - 使用原始用户查询条件
    const statsWhere = { userId: user.id }
    const stats = await prisma.generatedImage.aggregate({
      where: statsWhere,
      _count: { id: true },
      _sum: { 
        viewCount: true,
        downloadCount: true 
      }
    })

    // 获取本月统计
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyStats = await prisma.generatedImage.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: currentMonth
        }
      },
      _count: { id: true }
    })

    // 获取当前查询条件下的总数（用于分页）
    const totalCount = await prisma.generatedImage.count({ where })

    return NextResponse.json({
      success: true,
      data: {
        images: images.map(img => ({
          ...img,
          metadata: img.metadata ? JSON.parse(img.metadata) : null
        })),
        stats: {
          totalImage: stats._count.id,
          monthlyImage: monthlyStats._count.id,
          totalViews: stats._sum.viewCount || 0,
          totalDownloads: stats._sum.downloadCount || 0,
          // 收藏数暂时设为0，后续可扩展
          favoriteImage: 0
        },
        hasMore: offset + limit < totalCount,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    })

  } catch (error: any) {
    console.error('❌ 获取用户图片失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}