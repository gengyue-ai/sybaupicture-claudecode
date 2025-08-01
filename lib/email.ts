import { Resend } from 'resend'

// 延迟初始化Resend实例
let resend: Resend | null = null

function getResendInstance(): Resend {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return resend
}

// 邮件发送配置
const EMAIL_CONFIG = {
  from: 'Sybau Picture <noreply@sybaupicture.com>',
  replyTo: 'support@sybaupicture.com',
}

// 发送邮箱验证邮件
export async function sendVerificationEmail({
  email,
  token,
  locale = 'en'
}: {
  email: string
  token: string
  locale?: 'en' | 'zh'
}) {
  const isProduction = process.env.NODE_ENV === 'production'
  const baseUrl = process.env.NEXTAUTH_URL || 'https://sybaupicture.com'
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  // 中英双语邮件内容
  const emailContent = {
    en: {
      subject: 'Verify your email for Sybau Picture',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Sybau Picture</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">AI Image Generation Platform</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Welcome to Sybau Picture! Please click the button below to verify your email address and start creating amazing AI images.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              If you didn't create an account with Sybau Picture, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Sybau Picture. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Welcome to Sybau Picture!
        
        Please verify your email address by visiting: ${verifyUrl}
        
        If you didn't create an account with Sybau Picture, you can safely ignore this email.
      `
    },
    zh: {
      subject: '验证您的Sybau Picture邮箱',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Sybau Picture</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">AI图片生成平台</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">验证您的邮箱地址</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              欢迎来到Sybau Picture！请点击下方按钮验证您的邮箱地址，开始创作精美的AI图像。
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                验证邮箱地址
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              如果您没有在Sybau Picture创建账户，请忽略此邮件。
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Sybau Picture. 版权所有。
            </p>
          </div>
        </div>
      `,
      text: `
        欢迎来到Sybau Picture！
        
        请通过访问以下链接验证您的邮箱地址：${verifyUrl}
        
        如果您没有在Sybau Picture创建账户，请忽略此邮件。
      `
    }
  }

  const content = emailContent[locale]

  try {
    console.log('📧 发送验证邮件:', { email, locale, from: EMAIL_CONFIG.from })
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY未配置，邮件发送失败')
      console.error('💡 请在环境变量中设置: RESEND_API_KEY=re_Ymg1CPzA_QDVdCLPhrZNaqxdRms6ndiZE')
      return { success: false, error: 'Email service not configured - missing RESEND_API_KEY' }
    }

    const resendInstance = getResendInstance()
    const result = await resendInstance.emails.send({
      from: EMAIL_CONFIG.from,
      to: [email],
      subject: content.subject,
      html: content.html,
      text: content.text,
    })

    console.log('✅ 邮件发送成功:', result.data?.id)
    return { success: true, id: result.data?.id }
    
  } catch (error) {
    console.error('❌ 邮件发送失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// 发送密码重置邮件
export async function sendPasswordResetEmail({
  email,
  token,
  locale = 'en'
}: {
  email: string
  token: string
  locale?: 'en' | 'zh'
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://sybaupicture.com'
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  const emailContent = {
    en: {
      subject: 'Reset your Sybau Picture password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Sybau Picture</h1>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Click the button below to reset your password. This link will expire in 1 hour.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    },
    zh: {
      subject: '重置您的Sybau Picture密码',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Sybau Picture</h1>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">重置密码</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              点击下方按钮重置您的密码。此链接将在1小时后过期。
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                重置密码
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              如果您没有请求重置密码，请忽略此邮件。
            </p>
          </div>
        </div>
      `
    }
  }

  const content = emailContent[locale]

  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'Email service not configured' }
    }

    const resendInstance = getResendInstance()
    const result = await resendInstance.emails.send({
      from: EMAIL_CONFIG.from,
      to: [email],
      subject: content.subject,
      html: content.html,
    })

    return { success: true, id: result.data?.id }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// 发送联系表单邮件
export async function sendContactEmail({
  email,
  inquiryType,
  message,
  locale = 'en'
}: {
  email: string
  inquiryType: string
  message: string
  locale?: 'en' | 'zh'
}) {
  const currentTime = new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  // 发送给管理员的邮件内容
  const adminEmailContent = {
    en: {
      subject: `New Contact Form Submission - ${inquiryType}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Contact Form</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Sybau Picture Support</p>
          </div>
          
          <div style="background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Contact Details</h3>
              <p style="margin: 8px 0; color: #666;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 8px 0; color: #666;"><strong>Inquiry Type:</strong> ${inquiryType}</p>
              <p style="margin: 8px 0; color: #666;"><strong>Time:</strong> ${currentTime}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Message</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                This email was sent from the Sybau Picture contact form.
              </p>
            </div>
          </div>
        </div>
      `
    },
    zh: {
      subject: `新的联系表单提交 - ${inquiryType}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">新的联系表单</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Sybau Picture 客服</p>
          </div>
          
          <div style="background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">联系信息</h3>
              <p style="margin: 8px 0; color: #666;"><strong>邮箱:</strong> ${email}</p>
              <p style="margin: 8px 0; color: #666;"><strong>咨询类型:</strong> ${inquiryType}</p>
              <p style="margin: 8px 0; color: #666;"><strong>时间:</strong> ${currentTime}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">留言内容</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                此邮件来自 Sybau Picture 联系表单。
              </p>
            </div>
          </div>
        </div>
      `
    }
  }

  // 发送给用户的确认邮件内容
  const confirmationEmailContent = {
    en: {
      subject: 'Thank you for contacting Sybau Picture',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Sybau Picture</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">AI Image Generation Platform</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Thank You for Contacting Us!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              We've received your message about <strong>${inquiryType}</strong> and will get back to you as soon as possible.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">What happens next?</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Our team will review your message within 24 hours</li>
                <li>We'll respond directly to your email: ${email}</li>
                <li>For urgent issues, you can also reach us through our support center</li>
              </ul>
            </div>
            
            <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              Best regards,<br>
              The Sybau Picture Team
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Sybau Picture. All rights reserved.
            </p>
          </div>
        </div>
      `
    },
    zh: {
      subject: '感谢您联系 Sybau Picture',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Sybau Picture</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">AI图片生成平台</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">感谢您的联系！</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              我们已收到您关于<strong>${inquiryType}</strong>的留言，将尽快为您回复。
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">接下来会发生什么？</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>我们的团队将在24小时内审查您的消息</li>
                <li>我们会直接回复到您的邮箱：${email}</li>
                <li>如有紧急问题，您也可以通过我们的支持中心联系我们</li>
              </ul>
            </div>
            
            <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
              此致敬礼，<br>
              Sybau Picture 团队
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Sybau Picture. 版权所有。
            </p>
          </div>
        </div>
      `
    }
  }

  try {
    console.log('📧 发送联系表单邮件:', { email, inquiryType, locale })
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY未配置，邮件发送失败')
      return { success: false, error: 'Email service not configured - missing RESEND_API_KEY' }
    }

    const resendInstance = getResendInstance()
    const adminContent = adminEmailContent[locale]
    const confirmationContent = confirmationEmailContent[locale]

    // 发送给管理员的通知邮件
    const adminResult = await resendInstance.emails.send({
      from: EMAIL_CONFIG.from,
      to: [EMAIL_CONFIG.replyTo], // 发送到 support@sybaupicture.com
      subject: adminContent.subject,
      html: adminContent.html,
      replyTo: email, // 设置回复地址为用户邮箱
    })

    // 发送给用户的确认邮件
    const confirmationResult = await resendInstance.emails.send({
      from: EMAIL_CONFIG.from,
      to: [email],
      subject: confirmationContent.subject,
      html: confirmationContent.html,
      replyTo: EMAIL_CONFIG.replyTo,
    })

    console.log('✅ 联系邮件发送成功:', { 
      admin: adminResult.data?.id, 
      confirmation: confirmationResult.data?.id 
    })
    
    return { 
      success: true, 
      adminId: adminResult.data?.id,
      confirmationId: confirmationResult.data?.id
    }
    
  } catch (error) {
    console.error('❌ 联系邮件发送失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// 验证Resend配置
export function validateEmailConfig() {
  const requiredVars = ['RESEND_API_KEY']
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  return {
    isValid: missing.length === 0,
    missing,
    configured: requiredVars.filter(varName => !!process.env[varName])
  }
}