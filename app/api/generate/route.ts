import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'
import {
  getCurrentUserWithSubscription,
  canUserGenerateImage,
  recordImageGeneration,
  getUserPlanFeatures
} from '@/lib/subscription'

// 配置 Fal AI 客户端的函数
async function configureFalClient() {
  const fal = await import('@fal-ai/serverless-client')
  const falKey = process.env.FAL_KEY

  if (!falKey) {
    throw new Error('FAL_KEY environment variable is required')
  }

  console.log('Using Fal API Key:', falKey.substring(0, 10) + '...')

  fal.config({
    credentials: falKey
  })

  return { fal, falKey }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Starting image generation ===')

    // 配置 Fal AI 客户端
    const { fal } = await configureFalClient()

    // 检查用户认证
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please sign in to generate images.',
        code: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    // 获取用户信息
    const user = await getCurrentUserWithSubscription()
    if (!user) {
      console.error('User not found for session:', session?.user?.email)
      return NextResponse.json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    console.log('User found:', user.email)

    // 检查用户是否可以生成图片
    const usageCheck = await canUserGenerateImage(user.id)
    if (!usageCheck.canGenerate) {
      return NextResponse.json({
        success: false,
        error: `Monthly limit exceeded. You have used ${usageCheck.currentUsage}/${usageCheck.maxUsage} images this month.`,
        code: 'QUOTA_EXCEEDED',
        usage: usageCheck
      }, { status: 429 })
    }

    console.log(`User ${user.email} can generate image. Usage: ${usageCheck.currentUsage}/${usageCheck.maxUsage}`)

    const contentType = request.headers.get('content-type')
    console.log('Content-Type:', contentType)

    let prompt = ''
    let imageUrl = ''
    let mode = 'text-to-image'

    if (contentType?.includes('multipart/form-data')) {
      // 处理文件上传
      const formData = await request.formData()
      const file = formData.get('file') as File
      const promptText = formData.get('prompt') as string
      mode = formData.get('mode') as string || 'text-to-image'

      console.log('Mode:', mode)
      console.log('File uploaded:', file?.name, file?.size)
      console.log('Prompt text:', promptText)

      if (mode === 'image-to-image') {
        if (!file) {
          throw new Error('File is required for image-to-image mode')
        }
        // 将文件转换为 base64 URL
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        imageUrl = `data:${file.type};base64,${base64}`
        console.log('Image converted to base64, length:', base64.length)
        prompt = promptText || 'Transform this image into a Sybau style meme'
      } else {
        // text-to-image mode
        prompt = promptText || 'Create a Sybau style image'
        if (!prompt.trim()) {
          throw new Error('Prompt is required for text-to-image mode')
        }
      }
    } else {
      // 处理 JSON 请求
      const body = await request.json()
      prompt = body.prompt || 'Create a Sybau style image'
      imageUrl = body.image_url || ''
      mode = body.mode || 'text-to-image'
    }

    console.log('Prompt:', prompt)
    console.log('Has image:', !!imageUrl)

    // 🎯 修复：优先保留用户原始prompt，最小化风格干扰
    const enhancePrompt = (userPrompt: string, hasImage: boolean) => {
      if (!hasImage) {
        // text-to-image: 优先使用用户原始prompt，只添加基本的质量提升
        if (userPrompt && userPrompt.trim()) {
          // 保持用户原始意图，只添加质量和风格标签
          return `${userPrompt}, high quality, detailed, vibrant colors`
        } else {
          return 'Create a high quality, detailed image with vibrant colors'
        }
      } else {
        // image-to-image: 根据用户prompt决定处理方式
        if (userPrompt && userPrompt.trim() && userPrompt !== 'Transform this image into a Sybau style meme') {
          // 用户有明确要求，优先执行用户意图
          return `Transform this image: ${userPrompt}, maintain good composition, high quality`
        } else {
          // 没有具体要求，应用默认的Sybau风格转换
          return `Transform this image to Sybau meme style: enhanced expressions, slightly exaggerated features for humor, maintain original pose and background, high quality`
        }
      }
    }

    // 选择合适的模型
    let model = 'fal-ai/flux/schnell'
    let input: any = {
      prompt: enhancePrompt(prompt, !!imageUrl),
      num_inference_steps: 4,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true
    }

    // 如果有图片URL，使用图片到图片的模型
    if (imageUrl) {
      model = 'fal-ai/flux/dev'
      input = {
        ...input,
        image_url: imageUrl,
        strength: 0.25,
        num_inference_steps: 12,
        guidance_scale: 8.0
      }
    }

    console.log('Using model:', model)
    console.log('Input parameters:', JSON.stringify({...input, image_url: imageUrl ? '[base64 data]' : undefined}, null, 2))

    // 调用真实Fal AI API
    console.log('🚀 调用真实Fal AI API...')
    const result = await fal.subscribe(model, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update)
      }
    })

    console.log('Fal AI API result:', JSON.stringify(result, null, 2))
    const apiResult = result as { images?: Array<{ url: string }> }

    if (apiResult.images && apiResult.images.length > 0) {
      console.log('✅ Image generated successfully!')

      // 记录用户使用情况
      await recordImageGeneration(user.id)
      console.log(`Recorded image generation for user ${user.email}`)

      // 保存生成的图片到数据库（如果数据库可用）
      if (config.database.url && prisma) {
        try {
          await prisma.generatedImage.create({
            data: {
              userId: user.id,
              originalUrl: imageUrl || apiResult.images[0].url, // 原图或生成图
              processedUrl: apiResult.images[0].url, // 处理后的图片
              thumbnailUrl: apiResult.images[0].url, // 缩略图URL相同
              style: 'classic', // 默认风格
              intensity: 2, // 默认强度
              metadata: JSON.stringify({
                mode: mode,
                prompt: prompt,
                model: model,
                apiProvider: 'fal-ai',
                hasInputImage: !!imageUrl
              })
            }
          })
          console.log('✅ 图片已保存到数据库')
        } catch (dbError) {
          console.error('❌ 数据库保存失败:', dbError)
          // 不阻塞图片生成，继续返回结果
        }
      }

      // 获取用户套餐特性以确定是否应该有水印
      const planFeatures = await getUserPlanFeatures(user.id)

      // 返回生成的图片URL
      return NextResponse.json({
        success: true,
        imageUrl: apiResult.images[0].url,
        prompt: prompt,
        model: model,
        hasWatermark: planFeatures.hasWatermark,
        usage: {
          currentUsage: usageCheck.currentUsage + 1,
          maxUsage: usageCheck.maxUsage,
          remaining: usageCheck.remainingUsage - 1
        }
      })
    } else {
      console.error('No images generated')
      return NextResponse.json({
        success: false,
        error: 'No images were generated'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Image generation error:', error)
    
    // 返回详细错误信息
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  const { falKey } = await configureFalClient()

  return NextResponse.json({
    status: 'OK',
    message: 'Fal AI Generate API is running',
    keyConfigured: !!falKey
  })
}
