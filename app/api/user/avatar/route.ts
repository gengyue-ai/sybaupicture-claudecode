import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
// 动态导入sharp，处理部署时的兼容性问题
async function processImage(buffer: Buffer): Promise<Buffer> {
  try {
    const sharp = await import('sharp')
    return await sharp.default(buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer()
  } catch (error) {
    console.warn('Sharp处理失败，使用原始图片:', error)
    return buffer
  }
}

export async function POST(request: NextRequest) {
  try {
    // 检查用户认证
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: '请先登录'
      }, { status: 401 })
    }

    // 获取上传的文件
    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: '请选择头像文件'
      }, { status: 400 })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: '仅支持 JPG、PNG、WebP、GIF 格式的图片'
      }, { status: 400 })
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: '图片文件不能超过 5MB'
      }, { status: 400 })
    }

    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'public/uploads/avatars')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 检查 prisma 连接
    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: '数据库连接失败'
      }, { status: 500 })
    }

    // 生成文件名
    const userId = session.user.email?.split('@')[0] || 'user'
    const fileExtension = file.type.split('/')[1]
    const fileName = `${userId}-${Date.now()}.${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    // 处理图片: 调整尺寸和优化（支持降级）
    const buffer = Buffer.from(await file.arrayBuffer())
    const processedBuffer = await processImage(buffer)

    // 保存文件
    await writeFile(filePath, processedBuffer)

    // 生成访问URL
    const avatarUrl = `/uploads/avatars/${fileName}`

    // 更新数据库
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        image: avatarUrl,
        updatedAt: new Date()
      }
    })

    console.log('头像更新成功:', {
      userId: user.id,
      email: user.email,
      newAvatar: avatarUrl
    })

    return NextResponse.json({
      success: true,
      message: '头像更新成功',
      avatarUrl: avatarUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    })

  } catch (error) {
    console.error('头像上传失败:', error)
    return NextResponse.json({
      success: false,
      error: '头像上传失败，请重试'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: '请先登录'
      }, { status: 401 })
    }

    // 检查 prisma 连接
    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: '数据库连接失败'
      }, { status: 500 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: user
    })

  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({
      success: false,
      error: '获取用户信息失败'
    }, { status: 500 })
  }
} 