import { NextRequest, NextResponse } from 'next/server'
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

    // 增加下载计数
    await prisma.generatedImage.update({
      where: { id: imageId },
      data: { downloadCount: { increment: 1 } }
    })

    return NextResponse.json({
      message: 'Download recorded successfully'
    })

  } catch (error) {
    console.error('Error recording download:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 