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
    console.log('📧 发送验证邮件:', { email, locale })
    
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY未配置，邮件发送跳过')
      return { success: false, error: 'Email service not configured' }
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