import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Authentication required' },
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

    const imageId = params.id

    // 检查图片是否存在
    const image = await prisma.generatedImage.findFirst({
      where: {
        id: imageId
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // 简化的点赞功能 - 增加分享计数作为点赞
    await prisma.generatedImage.update({
      where: { id: imageId },
      data: { shareCount: { increment: 1 } }
    })

    // 获取更新后的图片信息
    const updatedImage = await prisma.generatedImage.findUnique({
      where: { id: imageId },
      select: { shareCount: true }
    })

    return NextResponse.json({
      message: 'Like recorded successfully',
      likes: updatedImage?.shareCount || 0
    })

  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 