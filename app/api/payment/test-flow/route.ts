import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'

// 支付流程测试API - 仅用于诊断
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        status: 'UNAUTHENTICATED',
        message: '需要登录才能测试支付流程'
      }, { status: 401 })
    }

    // 测试数据
    const testPayload = {
      planType: 'standard',
      billingCycle: 'monthly'
    }
    
    console.log('🧪 开始支付流程测试:', {
      user: session.user.email,
      testPayload
    })
    
    // 步骤1: 检查Stripe初始化
    if (!stripe) {
      return NextResponse.json({
        status: 'STRIPE_NOT_CONFIGURED',
        step: 'stripe_init',
        message: 'Stripe未正确初始化',
        details: 'Stripe客户端未配置，检查环境变量'
      })
    }
    
    // 步骤2: 检查价格ID
    const priceId = STRIPE_PRICE_IDS[testPayload.planType as keyof typeof STRIPE_PRICE_IDS]?.[testPayload.billingCycle as keyof typeof STRIPE_PRICE_IDS.standard]
    
    if (!priceId) {
      return NextResponse.json({
        status: 'PRICE_ID_MISSING',
        step: 'price_validation',
        message: `价格ID未找到: ${testPayload.planType} ${testPayload.billingCycle}`,
        details: { priceId, availablePrices: STRIPE_PRICE_IDS }
      })
    }
    
    // 步骤3: 测试创建客户
    let testCustomer
    try {
      testCustomer = await stripe.customers.create({
        email: `test-${Date.now()}@example.com`,
        name: 'Test Customer',
        metadata: {
          test: 'true',
          created_by: 'payment_test_api'
        }
      })
      console.log('✅ 测试客户创建成功:', testCustomer.id)
    } catch (error) {
      return NextResponse.json({
        status: 'CUSTOMER_CREATION_FAILED',
        step: 'customer_creation',
        message: '创建测试客户失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // 步骤4: 测试创建checkout session
    let testSession
    try {
      testSession = await stripe.checkout.sessions.create({
        customer: testCustomer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'https://sybaupicture.com/payment/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://sybaupicture.com/pricing',
        metadata: {
          test: 'true',
          userId: 'test-user',
          planType: testPayload.planType,
          billingCycle: testPayload.billingCycle
        }
      })
      console.log('✅ 测试checkout session创建成功:', testSession.id)
    } catch (error) {
      return NextResponse.json({
        status: 'CHECKOUT_SESSION_FAILED',
        step: 'checkout_session',
        message: '创建测试checkout session失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // 步骤5: 清理测试数据
    try {
      await stripe.customers.del(testCustomer.id)
      console.log('🧹 测试客户已清理:', testCustomer.id)
    } catch (error) {
      console.warn('⚠️ 清理测试客户失败:', error)
    }
    
    // 测试成功
    return NextResponse.json({
      status: 'SUCCESS',
      message: '支付流程测试通过',
      steps: {
        stripe_init: '✅ Stripe初始化成功',
        price_validation: '✅ 价格ID验证成功',
        customer_creation: '✅ 客户创建成功',
        checkout_session: '✅ Checkout session创建成功',
        cleanup: '✅ 测试数据清理完成'
      },
      details: {
        priceId,
        testCustomerId: testCustomer.id,
        testSessionId: testSession.id,
        sessionUrl: testSession.url
      }
    })
    
  } catch (error) {
    console.error('❌ 支付流程测试失败:', error)
    return NextResponse.json({
      status: 'ERROR',
      message: '支付流程测试出现未知错误',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}