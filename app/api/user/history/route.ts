import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 获取用户的生成图片历史
    const images = await prisma.generatedImage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalUrl: true,
        processedUrl: true,
        thumbnailUrl: true,
        style: true,
        intensity: true,
        viewCount: true,
        shareCount: true,
        downloadCount: true,
        createdAt: true,
        metadata: true,
      }
    })

    return NextResponse.json({
      images: images.map((img: any) => ({
        id: img.id,
        originalUrl: img.originalUrl,
        processedUrl: img.processedUrl,
        thumbnailUrl: img.thumbnailUrl,
        style: img.style,
        intensity: img.intensity,
        viewCount: img.viewCount,
        shareCount: img.shareCount,
        downloadCount: img.downloadCount,
        createdAt: img.createdAt.toISOString(),
        metadata: img.metadata,
      }))
    })

  } catch (error) {
    console.error('Error fetching user history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 