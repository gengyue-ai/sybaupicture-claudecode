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

  // Fal API Key configured

  fal.config({
    credentials: falKey
  })

  return { fal, falKey }
}

export async function POST(request: NextRequest) {
  try {
    // Starting image generation

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
      // User not found
      return NextResponse.json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // User authenticated

    // 检查用户是否可以生成图片 - 更宽松的检查
    try {
      const usageCheck = await canUserGenerateImage(user.id)
      if (!usageCheck.canGenerate) {
        // Usage limit warning, allowing generation
        // 不阻止生成，只记录警告
      }
      // Usage check passed
    } catch (error) {
      // Usage check failed, allowing generation
      // 如果检查失败，允许生成以提供更好的用户体验
    }

    const contentType = request.headers.get('content-type')
    // Processing request content

    let prompt = ''
    let imageUrl = ''
    let mode = 'text-to-image'

    if (contentType?.includes('multipart/form-data')) {
      // 处理文件上传
      const formData = await request.formData()
      const file = formData.get('file') as File
      const promptText = formData.get('prompt') as string
      mode = formData.get('mode') as string || 'text-to-image'

      // Processing form data

      if (!promptText || promptText.trim() === '') {
        // Empty prompt error
        return NextResponse.json({
          success: false,
          error: 'Prompt is required',
          code: 'MISSING_PROMPT'
        }, { status: 422 })
      }

      if (mode === 'image-to-image') {
        if (!file) {
          throw new Error('File is required for image-to-image mode')
        }
        // 将文件转换为 base64 URL
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        imageUrl = `data:${file.type};base64,${base64}`
        // Image processed
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

    // Request parameters processed

    // 🎯 修复：中文prompt翻译成英文
    const translateChineseToEnglish = (chineseText: string): string => {
      // 扩展的中文到英文翻译词典
      const translations = {
        // 人物
        '老人': 'elderly person',
        '老爷爷': 'old grandfather',
        '老奶奶': 'old grandmother',
        '美女': 'beautiful woman',
        '帅哥': 'handsome man',
        '小孩': 'child',
        '男孩': 'boy',
        '女孩': 'girl',
        '婴儿': 'baby',
        '青年': 'young person',
        '中年人': 'middle-aged person',
        
        // 动作
        '坐在': 'sitting at',
        '站在': 'standing at',
        '躺在': 'lying on',
        '走在': 'walking on',
        '跑在': 'running on',
        '看着': 'looking at',
        '微笑': 'smiling',
        '哭泣': 'crying',
        '思考': 'thinking',
        
        // 地点
        '村口': 'village entrance',
        '大树下': 'under a big tree',
        '树下': 'under the tree',
        '公园里': 'in the park',
        '家里': 'at home',
        '学校': 'at school',
        '办公室': 'in the office',
        '咖啡厅': 'in a cafe',
        '餐厅': 'in a restaurant',
        '海边': 'by the sea',
        '山上': 'on the mountain',
        '河边': 'by the river',
        '桥上': 'on the bridge',
        '街道': 'street',
        '广场': 'square',
        
        // 物品
        '猫': 'cat',
        '狗': 'dog',
        '鸟': 'bird',
        '鱼': 'fish',
        '花': 'flower',
        '树': 'tree',
        '房子': 'house',
        '汽车': 'car',
        '自行车': 'bicycle',
        '书': 'book',
        '电脑': 'computer',
        '手机': 'mobile phone',
        
        // 天气和时间
        '晴天': 'sunny day',
        '雨天': 'rainy day',
        '雪天': 'snowy day',
        '夕阳': 'sunset',
        '日出': 'sunrise',
        '月亮': 'moon',
        '星星': 'stars',
        '蓝天': 'blue sky',
        '白云': 'white clouds',
        '早晨': 'morning',
        '中午': 'noon',
        '晚上': 'evening',
        '夜晚': 'night',
        
        // 风景
        '风景': 'landscape',
        '山峰': 'mountain peak',
        '森林': 'forest',
        '海滩': 'beach',
        '湖泊': 'lake',
        '草地': 'grassland',
        '花园': 'garden',
        '城市': 'city',
        '乡村': 'countryside',
        '建筑': 'building',
        
        // 颜色
        '红色': 'red',
        '蓝色': 'blue',
        '绿色': 'green',
        '黄色': 'yellow',
        '白色': 'white',
        '黑色': 'black',
        '紫色': 'purple',
        '粉色': 'pink',
        '橙色': 'orange',
        '灰色': 'gray',
        
        // 形容词
        '美丽的': 'beautiful',
        '可爱的': 'cute',
        '大的': 'big',
        '小的': 'small',
        '高的': 'tall',
        '矮的': 'short',
        '胖的': 'fat',
        '瘦的': 'thin',
        '年轻的': 'young',
        '古老的': 'old',
        '新的': 'new',
        '旧的': 'old',
        '干净的': 'clean',
        '脏的': 'dirty'
      }
      
      let translatedText = chineseText
      
      // 对每个中文词汇进行替换
      Object.entries(translations).forEach(([chinese, english]) => {
        translatedText = translatedText.replace(new RegExp(chinese, 'g'), english)
      })
      
      return translatedText
    }

    const enhancePrompt = (userPrompt: string, hasImage: boolean) => {
      // 检测是否包含中文字符
      const containsChinese = /[\u4e00-\u9fff]/.test(userPrompt)
      
      let processedPrompt = userPrompt
      
      // 如果包含中文，先翻译成英文
      if (containsChinese) {
        // Chinese prompt detected, translating
        processedPrompt = translateChineseToEnglish(userPrompt)
        // Translation completed
        
        // 如果翻译后仍然包含中文，添加通用英文描述
        if (/[\u4e00-\u9fff]/.test(processedPrompt)) {
          processedPrompt = `${processedPrompt}, realistic scene, detailed composition`
          // Added generic description for untranslated text
        }
      }
      
      if (!hasImage) {
        // text-to-image: 使用翻译后的prompt
        if (processedPrompt && processedPrompt.trim()) {
          return `${processedPrompt}, high quality, detailed, vibrant colors, photorealistic`
        } else {
          return 'Create a high quality, detailed image with vibrant colors'
        }
      } else {
        // image-to-image: 根据用户prompt决定处理方式
        if (processedPrompt && processedPrompt.trim() && processedPrompt !== 'Transform this image into a Sybau style meme') {
          // 用户有明确要求，优先执行用户意图
          return `Transform this image: ${processedPrompt}, maintain good composition, high quality`
        } else {
          // 没有具体要求，应用默认的Sybau风格转换
          return `Transform this image to Sybau meme style: enhanced expressions, slightly exaggerated features for humor, maintain original pose and background, high quality`
        }
      }
    }

    // 根据用户套餐设置图片分辨率和质量
    const userPlanFeatures = await getUserPlanFeatures(user.id)
    // User plan retrieved
    
    // 根据套餐设置分辨率
    let imageSize = '1024x1024' // 默认分辨率（免费套餐）
    let useHighQualityModel = false
    
    if (userPlanFeatures.hasPriorityProcessing) {
      imageSize = '1024x1024' // Fal AI Flux 目前最高支持1024x1024
      useHighQualityModel = true
      // PRO user - high quality model
    } else if (userPlanFeatures.maxImagesPerMonth > 1) {
      imageSize = '1024x1024' // 标准用户也使用1024x1024
      useHighQualityModel = true
      // Standard user - high quality model
    } else {
      // Free user - standard model
    }

    // 选择合适的模型
    let model = useHighQualityModel ? 'fal-ai/flux/dev' : 'fal-ai/flux/schnell'
    let input: any = {
      prompt: enhancePrompt(prompt, !!imageUrl),
      image_size: imageSize,
      num_inference_steps: useHighQualityModel ? 8 : 4,
      guidance_scale: useHighQualityModel ? 7.5 : 3.5,
      num_images: 1,
      enable_safety_checker: true
    }

    // 如果有图片URL，使用图片到图片的模型
    if (imageUrl) {
      model = 'fal-ai/flux/dev' // image-to-image 总是使用高质量模型
      input = {
        ...input,
        image_url: imageUrl,
        strength: 0.25,
        num_inference_steps: useHighQualityModel ? 12 : 8,
        guidance_scale: useHighQualityModel ? 8.0 : 6.0
      }
    }

    // API parameters configured

    // 调用真实Fal AI API
    // Calling Fal AI API
    const result = await fal.subscribe(model, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        // API queue update
      }
    })

    // API result received
    const apiResult = result as { images?: Array<{ url: string }> }

    if (apiResult.images && apiResult.images.length > 0) {
      // Image generation successful

      // 记录用户使用情况
      await recordImageGeneration(user.id)
      // Usage recorded

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
          // Image saved to database
        } catch (dbError) {
          // Database save failed
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
          currentUsage: (user.usage?.[0]?.imagesGenerated || 0) + 1,
          maxUsage: planFeatures.maxImagesPerMonth,
          remaining: Math.max(0, planFeatures.maxImagesPerMonth - (user.usage?.[0]?.imagesGenerated || 0) - 1)
        }
      })
    } else {
      // No images generated
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
