import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session) {
      console.log('🔄 用户退出登录:', session.user?.email)
    }

    // 创建响应并清除所有相关的cookies
    const response = NextResponse.json({ success: true, message: 'Successfully signed out' })
    
    // 清除NextAuth相关的cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      '__Secure-next-auth.callback-url'
    ]

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    // 添加额外的清除头
    response.headers.set('Clear-Site-Data', '"cookies", "storage"')
    
    return response
  } catch (error) {
    console.error('❌ 退出登录错误:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}