import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createPrismaClient } from '@/lib/prisma'
import { config } from '@/lib/config'
import { SessionUser } from '@/types'
import {
  getCurrentUserWithSubscription,
  canUserGenerateImage,
  recordImageGeneration,
  getUserPlanFeatures
} from '@/lib/subscription'
import { getTemplateById } from '@/lib/templateData'

// 配置 Fal AI 客户端的函数
async function configureFalClient() {
  const fal = await import('@fal-ai/serverless-client')
  const falKey = process.env.FAL_KEY

  if (!falKey) {
    console.error('❌ FAL_KEY环境变量缺失:', {
      NODE_ENV: process.env.NODE_ENV,
      hasFalKey: !!falKey
    })
    throw new Error('FAL_KEY environment variable is required')
  }

  console.log('✅ Fal AI配置成功')

  fal.config({
    credentials: falKey
  })

  return { fal, falKey }
}

export async function POST(request: NextRequest) {
  try {
    // Starting image generation
    
    // 🎯 创建独立的数据库连接，避免prepared statement冲突
    const prisma = createPrismaClient()

    // 配置 Fal AI 客户端
    const { fal } = await configureFalClient()

    // 🔐 检查管理员密钥绕过（仅用于生成展示图片）
    const adminSecret = request.headers.get('x-admin-secret')
    const isAdminRequest = adminSecret && (
      adminSecret === process.env.SHOWCASE_ADMIN_SECRET
    )
    
    if (isAdminRequest) {
      console.log('🔧 管理员模式：跳过认证用于生成展示图片')
    } else {
      // 检查用户认证
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required. Please sign in to generate images.',
          code: 'UNAUTHORIZED'
        }, { status: 401 })
      }
    }

    // 🎯 Ultra-Think修复：优化用户信息获取和权限检查
    let user: SessionUser | null = null
    let canGenerate = true
    let usageInfo = { currentUsage: 0, maxUsage: 1, remainingUsage: 1 }

    if (isAdminRequest) {
      // 管理员模式：使用模拟专业用户
      user = {
        id: 'admin-showcase-generator',
        email: 'admin@showcase.local',
        name: 'Showcase Generator',
        image: '',
        planId: 'professional'
      }
      console.log('🔧 管理员模式：使用模拟专业用户')
    } else {
      try {
        const dbUser = await getCurrentUserWithSubscription()
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || dbUser.email,
            image: dbUser.image || '',
            planId: dbUser.planId || undefined,
            usage: dbUser.usage
          }
        }
        console.log('✅ 用户信息获取结果:', { 
          hasUser: !!user, 
          userId: user?.id?.substring(0, 10) + '...', 
          email: user?.email 
        })
      } catch (userError) {
        console.error('❌ 获取用户信息失败:', userError)
        // 不阻塞生成，使用默认权限
        const session = await getServerSession(authOptions)
        if (session?.user?.email) {
          user = {
            id: `temp-${session.user.email}`,
            email: session.user.email,
            name: session.user.name || session.user.email,
            image: session.user.image || '',
            planId: 'free'
          }
        } else {
          return NextResponse.json({ error: '用户未登录' }, { status: 401 })
        }
        console.log('🔄 使用临时用户信息继续生成')
      }
    }

    if (!user) {
      console.error('❌ 用户信息完全获取失败')
      return NextResponse.json({
        success: false,
        error: 'Unable to authenticate user. Please try signing in again.',
        code: 'USER_AUTH_FAILED'
      }, { status: 401 })
    }

    // 🎯 Ultra-Think修复：安全的用量检查，不因数据库问题阻塞用户
    try {
      if (isAdminRequest) {
        // 管理员模式：跳过用量检查
        console.log('🔧 管理员模式：跳过用量检查')
        canGenerate = true
      } else if (user.id && !user.id.startsWith('temp-')) {
        // 只对真实用户进行数据库用量检查
        const usageCheck = await canUserGenerateImage(user.id)
        canGenerate = usageCheck.canGenerate
        usageInfo = {
          currentUsage: usageCheck.currentUsage,
          maxUsage: usageCheck.maxUsage,
          remainingUsage: usageCheck.remainingUsage
        }
        
        console.log('📊 用量检查结果:', usageInfo)
        
        if (!canGenerate) {
          return NextResponse.json({
            success: false,
            error: `Generation limit reached. Used ${usageInfo.currentUsage}/${usageInfo.maxUsage} images this month. Please upgrade your plan for more generations.`,
            code: 'USAGE_LIMIT_EXCEEDED',
            usage: usageInfo
          }, { status: 429 })
        }
      } else {
        // 临时用户使用默认免费限制，但不进行严格检查
        console.log('🎯 临时用户，使用宽松的用量策略')
        canGenerate = true
      }
    } catch (usageError) {
      console.warn('⚠️ 用量检查失败，允许生成（提供更好用户体验）:', usageError)
      // 用量检查失败时仍允许生成，避免因数据库问题影响用户体验
      canGenerate = true
    }

    const contentType = request.headers.get('content-type')
    // Processing request content

    let prompt = ''
    let imageUrl = ''
    let mode = 'text-to-image'
    let taskType = 'generate'
    let templateId = ''

    if (contentType?.includes('multipart/form-data')) {
      // 🎯 Ultra-Think修复：增强FormData解析和错误处理
      try {
        console.log('📋 开始解析FormData')
        const formData = await request.formData()
        const file = formData.get('file') as File
        const promptText = formData.get('prompt') as string
        taskType = formData.get('taskType') as string || 'generate'
        mode = formData.get('mode') as string || 'text-to-image'
        templateId = formData.get('templateId') as string || ''

        console.log('📋 FormData解析结果:', {
          hasFile: !!file,
          fileName: file?.name,
          fileSize: file?.size,
          fileType: file?.type,
          promptLength: promptText?.length || 0,
          mode: mode,
          templateId: templateId
        })

        // 🔧 增强文件验证
        if (mode === 'image-to-image') {
          if (!file || file.size === 0) {
            console.error('❌ 图片模式缺少文件')
            return NextResponse.json({
              success: false,
              error: 'Please select an image file for image-to-image generation.',
              code: 'FILE_REQUIRED'
            }, { status: 400 })
          }

          // 验证文件类型
          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
          if (!allowedTypes.includes(file.type)) {
            console.error('❌ 不支持的文件类型:', file.type)
            return NextResponse.json({
              success: false,
              error: 'Please upload a JPG, PNG, or WebP image file.',
              code: 'INVALID_FILE_TYPE'
            }, { status: 400 })
          }

          // 验证文件大小 (5MB限制)
          if (file.size > 5 * 1024 * 1024) {
            console.error('❌ 文件过大:', file.size)
            return NextResponse.json({
              success: false,
              error: 'File size must be less than 5MB. Please compress your image and try again.',
              code: 'FILE_TOO_LARGE'
            }, { status: 400 })
          }

          // 安全的文件处理
          try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const base64 = buffer.toString('base64')
            imageUrl = `data:${file.type};base64,${base64}`
            console.log('✅ 文件转换成功，大小:', base64.length)
          } catch (fileError) {
            console.error('❌ 文件处理失败:', fileError)
            return NextResponse.json({
              success: false,
              error: 'Failed to process image file. Please try uploading a different image.',
              code: 'FILE_PROCESSING_ERROR'
            }, { status: 400 })
          }

          // 为图片模式设置prompt
          prompt = promptText && promptText.trim() !== '' 
            ? promptText 
            : 'Transform this image into a Sybau style meme'
        } else {
          // text-to-image mode
          if (!promptText || promptText.trim() === '') {
            console.error('❌ 文字模式缺少提示词')
            return NextResponse.json({
              success: false,
              error: 'Please enter a text prompt to generate an image.',
              code: 'PROMPT_REQUIRED'
            }, { status: 400 })
          }
          prompt = promptText.trim()
        }

        console.log('✅ FormData解析完成:', { mode, hasImage: !!imageUrl, promptLength: prompt.length })

      } catch (formDataError) {
        console.error('❌ FormData解析失败:', {
          error: formDataError,
          message: formDataError instanceof Error ? formDataError.message : 'Unknown error',
          contentType: contentType
        })
        
        return NextResponse.json({
          success: false,
          error: 'Failed to process your request. Please check your input and try again.',
          code: 'REQUEST_PROCESSING_ERROR',
          details: process.env.NODE_ENV === 'development' ? formDataError instanceof Error ? formDataError.message : 'Parse error' : undefined
        }, { status: 400 })
      }
    } else {
      // 处理 JSON 请求
      const body = await request.json()
      prompt = body.prompt || 'Create a Sybau style image'
      imageUrl = body.image_url || ''
      mode = body.mode || 'text-to-image'
      taskType = body.taskType || 'generate'
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
        // text-to-image: 简化prompt，避免过度复杂
        return processedPrompt && processedPrompt.trim() ? processedPrompt : 'a beautiful mountain landscape'
      } else {
        // image-to-image: 直接使用用户prompt
        return processedPrompt && processedPrompt.trim() ? processedPrompt : 'improve this image'
      }
    }

    // 🎯 Ultra-Think修复：安全的套餐特性获取
    let userPlanFeatures
    try {
      if (user.id && !user.id.startsWith('temp-')) {
        userPlanFeatures = await getUserPlanFeatures(user.id)
        console.log('✅ 用户套餐特性获取成功:', {
          userId: user.id.substring(0, 10) + '...',
          maxImages: userPlanFeatures.maxImagesPerMonth,
          hasPriority: userPlanFeatures.hasPriorityProcessing
        })
      } else {
        // 临时用户使用默认免费套餐特性
        const { DEFAULT_PLANS } = await import('@/lib/subscription')
        userPlanFeatures = DEFAULT_PLANS.free
        console.log('🎯 临时用户使用默认免费套餐特性')
      }
    } catch (planError) {
      console.error('❌ 获取用户套餐特性失败:', planError)
      // 回退到默认免费套餐
      const { DEFAULT_PLANS } = await import('@/lib/subscription')
      userPlanFeatures = DEFAULT_PLANS.free
      console.log('🔄 使用默认免费套餐特性作为回退')
    }
    
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

    // 🎯 基于Fal AI官方文档的精确模型选择
    let model: string
    let input: Record<string, unknown>

    // 确定用户等级
    const userLevel = userPlanFeatures.hasPriorityProcessing ? 'pro' : 
                     userPlanFeatures.maxImagesPerMonth > 3 ? 'standard' : 'free'

    if (imageUrl) {
      // 图生图/编辑：使用官方推荐的 FLUX Kontext [pro] 模型
      // 专门用于"定向局部编辑和复杂变换"
      model = 'fal-ai/flux-pro/kontext'
      
      // 🎯 获取模版的optimalSettings参数
      let templateSettings = null
      if (templateId) {
        const template = getTemplateById(templateId)
        if (template) {
          templateSettings = template.optimalSettings
          console.log('✅ 应用模版参数:', {
            templateId,
            templateName: template.title.en,
            settings: templateSettings
          })
        }
      }
      
      // 使用模版参数或默认参数
      input = {
        prompt: enhancePrompt(prompt, true),
        image_url: imageUrl,
        num_inference_steps: templateSettings?.num_inference_steps || 50,
        guidance_scale: templateSettings?.guidance_scale || 3.5,
        safety_tolerance: templateSettings?.safety_tolerance || 2,
        seed: templateSettings?.seed || 123456
      }
    } else {
      // 文生图：使用官方验证的 FLUX.1 [dev] 模型  
      // 12亿参数，支持商业使用
      model = 'fal-ai/flux/dev'
      input = {
        prompt: prompt || 'a beautiful mountain landscape'
      }
    }

    // API parameters configured

    // 调用真实Fal AI API
    console.log('🎯 调用Fal AI API:', {
      model,
      taskType,
      userLevel,
      hasPrompt: !!input.prompt,
      imageSize: input.image_size,
      hasImageUrl: !!input.image_url
    })
    
    const result = await fal.subscribe(model, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log('📊 API队列更新:', update)
      }
    })

    console.log('✅ Fal AI API响应成功')
    const apiResult = result as { images?: Array<{ url: string }> }

    if (apiResult.images && apiResult.images.length > 0) {
      // Image generation successful

      // 🎯 Ultra-Think修复：安全的使用记录更新
      try {
        if (user.id && !user.id.startsWith('temp-')) {
          await recordImageGeneration(user.id)
          console.log('✅ 用户使用记录更新成功')
        } else {
          console.log('🎯 临时用户跳过使用记录更新')
        }
      } catch (recordError) {
        console.error('⚠️ 使用记录更新失败，但不影响图片生成:', recordError)
        // 不阻塞图片生成流程
      }

      // 🎯 Ultra-Think修复：安全的数据库保存
      const canSaveToDb = config.database.url && prisma && user.id && !user.id.startsWith('temp-')
      console.log('🎯 数据库保存条件检查:', {
        hasDatabaseUrl: !!config.database.url,
        hasPrisma: !!prisma,
        hasUserId: !!user.id,
        userId: user.id,
        isNotTempUser: user.id ? !user.id.startsWith('temp-') : false,
        canSaveToDb
      })
      
      if (canSaveToDb) {
        try {
          // 从input中获取实际使用的参数
          const style = (input.style as string) || 'professional' // 使用实际的风格参数
          const intensity = (input.intensity as number) || 3 // 使用实际的强度参数
          
          await prisma.generatedImage.create({
            data: {
              userId: user.id,
              originalUrl: imageUrl || 'none', // 原图URL，如果是文生图则标记为none
              processedUrl: apiResult.images[0].url, // 处理后的图片
              thumbnailUrl: apiResult.images[0].url, // 缩略图URL与处理后图片相同
              style: style || 'none', // 使用实际风格
              intensity: intensity || 3, // 使用实际强度
              processingTime: Date.now() / 1000, // 处理时间（简化计算）
              metadata: JSON.stringify({
                prompt: enhancePrompt(prompt, !!imageUrl),
                model: model,
                apiProvider: 'fal-ai',
                hasInputImage: !!imageUrl,
                generationMode: imageUrl ? 'image-to-image' : 'text-to-image',
                imageSize: input.image_size || '1024x1024',
                num_inference_steps: input.num_inference_steps,
                guidance_scale: input.guidance_scale,
                userLevel: userLevel
              })
            }
          })
          console.log('✅ 图片记录保存到数据库成功:', {
            userId: user.id.substring(0, 10) + '...',
            style,
            intensity,
            hasOriginal: !!imageUrl
          })
        } catch (dbError) {
          console.error('⚠️ 数据库保存失败，但不影响图片生成:', {
            error: dbError,
            userId: user.id,
            userIdLength: user.id?.length,
            isValidUserId: !user.id.startsWith('temp-'),
            imageUrl: apiResult.images[0]?.url,
            hasValidImageResult: !!apiResult.images[0]?.url,
            databaseConnected: !!prisma,
            databaseUrl: !!config.database.url
          })
          // 不阻塞图片生成，继续返回结果
        }
      } else {
        console.log('🎯 跳过数据库保存（临时用户或数据库不可用）')
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
    
    // 🔒 生产环境安全：不暴露敏感错误信息
    const isProduction = process.env.NODE_ENV === 'production'
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed. Please try again.',
      details: isProduction ? undefined : (error instanceof Error ? error.stack : undefined)
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
