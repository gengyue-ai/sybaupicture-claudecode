import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 测试数据库连接...')
    
    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: 'Prisma client not initialized',
        details: 'DATABASE_URL may be missing or invalid'
      }, { status: 500 })
    }

    // 测试基本连接
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ 数据库连接测试成功')

    // 测试用户表查询
    const userCount = await prisma.user.count()
    console.log('✅ 用户表查询成功，用户数量:', userCount)

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount: userCount,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ 数据库测试失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}