/**
 * 统一的类型定义文件
 * 用于消除项目中的 any 类型使用
 */

import { NextRequest } from 'next/server'

// 基础错误类型
export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

// API响应基础类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 用户相关类型
export interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  planId?: string
  subscriptionPlan?: string
  isSubscribed?: boolean
}

// 扩展的NextAuth用户类型
export interface ExtendedUser extends UserProfile {
  emailVerified?: Date | null
  provider?: string
  createdAt?: Date
  updatedAt?: Date
}

// Session用户类型（带有扩展属性）
export interface SessionUser {
  id: string
  email: string
  name: string
  image: string
  planId?: string
  subscriptionPlan?: string
  isSubscribed?: boolean
  usage?: UserUsageStats[]
}

// 数据库连接错误类型
export interface DatabaseError extends Error {
  code?: string
  constraint?: string
  detail?: string
}

// Stripe相关类型
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: Record<string, unknown>
    previous_attributes?: Record<string, unknown>
  }
  created: number
  livemode: boolean
}

// 图片生成相关类型
export interface ImageGenerationRequest {
  mode: 'text-to-image' | 'image-to-image'
  prompt: string
  style: string
  intensity: number
  taskType: 'generate' | 'retouch' | 'enhance' | 'edit'
  file?: File
}

export interface ImageGenerationResponse {
  success: boolean
  imageUrl?: string
  error?: string
  details?: string
}

// 模板相关类型
export interface EditTemplate {
  id: string
  key: string
  name: string
  nameEn: string
  category: string
  tags: string[]
  beforeImage: string
  afterImage: string
  isActive: boolean
  isPopular: boolean
  isFeatured: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

// 用户使用统计类型
export interface UserUsageStats {
  id: string
  userId: string
  month: number
  year: number
  imagesGenerated: number
  lastResetAt: Date
}

// 订阅计划类型
export interface SubscriptionPlan {
  id: string
  name: string
  displayName: string
  maxImagesPerMonth: number
  maxResolution: string
  hasWatermark: boolean
  hasPriorityProcessing: boolean
  hasBatchProcessing: boolean
  hasAdvancedFeatures: boolean
  availableStyles: string[]
}

// 表单数据类型
export interface ContactFormData {
  name: string
  email: string
  message: string
}

export interface AuthFormData {
  email: string
  password: string
  name?: string
}

// 通知设置类型
export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  subscriptionUpdates: boolean
}

// 系统配置类型
export interface SystemConfig {
  key: string
  value: string
  category: string
}

// Prisma相关类型辅助
export type PrismaTransactionClient = Omit<import('@prisma/client').PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

// HTTP请求扩展类型
export interface ExtendedNextRequest extends NextRequest {
  user?: SessionUser
}

// 错误处理函数类型
export type ErrorHandler = (error: Error | DatabaseError | ApiError) => void

// 成功回调类型
export type SuccessCallback<T = unknown> = (data: T) => void

// 异步操作结果类型
export interface AsyncResult<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
}

// 分页类型
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// 文件上传类型
export interface FileUploadResult {
  success: boolean
  url?: string
  filename?: string
  size?: number
  error?: string
}

// 邮件发送类型
export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

// JWT Token类型
export interface JWTToken {
  id?: string
  email?: string
  name?: string
  picture?: string
  planId?: string
  subscriptionPlan?: string
  isSubscribed?: boolean
  sub?: string
  iat?: number
  exp?: number
}

// Webhook验证类型
export interface WebhookValidationResult {
  isValid: boolean
  error?: string
  data?: unknown
}