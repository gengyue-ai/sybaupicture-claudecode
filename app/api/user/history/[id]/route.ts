import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
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

    // 确保图片属于当前用户
    const image = await prisma.generatedImage.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found or not owned by user' },
        { status: 404 }
      )
    }

    // 删除图片记录
    await prisma.generatedImage.delete({
      where: { id: params.id }
    })

    // 注意：在生产环境中，你可能还需要删除实际的图片文件
    // 例如从云存储服务中删除文件

    return NextResponse.json({
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 