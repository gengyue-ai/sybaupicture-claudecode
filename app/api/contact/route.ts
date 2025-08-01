import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'
import { z } from 'zod'

// 联系表单数据验证模式
const contactFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  inquiryType: z.string().min(1, 'Inquiry type is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  locale: z.enum(['en', 'zh']).optional().default('en')
})

// 简单的频率限制存储（生产环境应使用Redis）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15分钟窗口
  const maxRequests = 5 // 最多5次提交

  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    // 新用户或时间窗口重置
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false // 超过限制
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // 获取用户IP进行频率限制
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          errorCode: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // 验证请求数据
    const validatedData = contactFormSchema.parse(body)
    const { email, inquiryType, message, locale } = validatedData

    console.log('📝 收到联系表单提交:', { email, inquiryType, locale, ip })

    // 基本安全检查
    if (message.includes('<script>') || message.includes('javascript:')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid message content',
          errorCode: 'INVALID_CONTENT'
        },
        { status: 400 }
      )
    }

    // 发送邮件
    const emailResult = await sendContactEmail({
      email,
      inquiryType,
      message,
      locale
    })

    if (!emailResult.success) {
      console.error('❌ 邮件发送失败:', emailResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send email. Please try again later.',
          errorCode: 'EMAIL_SEND_FAILED'
        },
        { status: 500 }
      )
    }

    console.log('✅ 联系表单处理成功:', emailResult)

    return NextResponse.json({
      success: true,
      message: locale === 'zh' 
        ? '感谢您的联系！我们会在24小时内回复您。' 
        : 'Thank you for contacting us! We will get back to you within 24 hours.',
      emailIds: {
        admin: emailResult.adminId,
        confirmation: emailResult.confirmationId
      }
    })

  } catch (error) {
    console.error('❌ 联系表单API错误:', error)

    // 处理验证错误
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          fieldErrors
        },
        { status: 400 }
      )
    }

    // 处理JSON解析错误
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON format',
          errorCode: 'INVALID_JSON'
        },
        { status: 400 }
      )
    }

    // 通用错误处理
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.',
        errorCode: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// 处理不支持的HTTP方法
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}