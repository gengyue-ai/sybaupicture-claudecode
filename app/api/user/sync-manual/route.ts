import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { syncUser } from '@/lib/user-sync'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    console.log('🔧 手动同步用户:', session.user.email)

    try {
      const user = await syncUser({
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      })

      if (user) {
        return NextResponse.json({
          success: true,
          message: '用户同步成功',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: '用户同步失败'
        }, { status: 500 })
      }
    } catch (syncError) {
      console.error('❌ 手动用户同步失败:', syncError)
      return NextResponse.json({
        success: false,
        error: '用户同步过程中发生错误',
        details: syncError instanceof Error ? syncError.message : String(syncError)
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ 手动同步API错误:', error)
    return NextResponse.json({
      success: false,
      error: 'API处理失败'
    }, { status: 500 })
  }
} 