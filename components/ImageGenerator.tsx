'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider'
import { Upload, Download, Sparkles, Loader2, AlertCircle, X, Type, Image as ImageIcon, Star, Lock, RotateCcw, Zap, Target, ArrowRight, Grid } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { getTemplateById, categoryInfo, templateData, type TemplateData } from '@/lib/templateData'
import { getUserAvailableTemplates } from '@/lib/subscription'
import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { SessionUser } from '@/types'

interface ImageGeneratorProps {
  texts: {
    uploadTitle: string
    uploadDescription: string
    uploadPlaceholder: string
    settingsTitle: string
    settingsDescription: string
    styleLabel: string
    styleOption: string
    styleDescription: string
    promptLabel: string
    promptPlaceholder: string
    generateButton: string
    downloadButton: string
    generating: string
    success: string
    error: string
    maxFileSize: string
    supportedFormats: string
    dragAndDrop: string
    clickToBrowse: string
    intensityLabel?: string
    modeLabel?: string
    classicMode?: string
    exaggeratedMode?: string
    professionalMode?: string
    creativeMode?: string
    classicDescription?: string
    exaggeratedDescription?: string
    professionalDescription?: string
    creativeDescription?: string
    textToImageMode?: string
    imageToImageMode?: string
    textPromptLabel?: string
    textPromptPlaceholder?: string
    detailedPrompt?: string
    detailsHelpAI?: string
    optionalStyleChange?: string
    dragImageHere?: string
    orClickToSelect?: string
    supportedFormatsShort?: string
    loginToStart?: string
    startCreating?: string
    creationInProgress?: string
    creationWait?: string
    creationResult?: string
    creationResultDesc?: string
    creationComplete?: string
    creationReady?: string
    creationWaiting?: string
    downloadImage?: string
    recreate?: string
    creationPreparation?: string
    creationPreparationDesc?: string
    creationMode?: string
    // 新增的文本键  
    textToImage?: string
    smartRetouch?: string
    hdEnhance?: string
    imageEdit?: string
    textMode?: string
    imageMode?: string
    dragImagePlaceholder?: string
    selectFile?: string
    styleOptional?: string
    style?: string
    intensity?: string
    generate?: string
    result?: string
    random?: string
    // 新增国际化键
    templateLibrary?: string
    processingIntensity?: string
    uploadImage?: string
    optionalDescription?: string
    templatesCount?: string
    dragOrPaste?: string
    supportedFormatsDetail?: string
    imageToImage?: string
    aiProcessing?: string
    estimatedTime?: string
    needUpgrade?: string
    upgradeNow?: string
  }
}

export default function ImageGenerator({ texts }: ImageGeneratorProps) {
  const { data: session, status } = useSession()
  const { checkUsagePermission, updateUsageCount, usageCount, maxUsage, subscriptionPlan, isSubscribed, refreshData } = useUserProfile()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // 模板相关状态
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([])
  const [isTemplateMode, setIsTemplateMode] = useState(false)
  const [templateAccessChecking, setTemplateAccessChecking] = useState(false)
  
  // 原有状态
  const [file, setFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [textPrompt, setTextPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedMode, setSelectedMode] = useState('classic')
  const [intensity, setIntensity] = useState(3)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [generationMode, setGenerationMode] = useState<'text-to-image' | 'image-to-image'>('image-to-image')
  const [taskType, setTaskType] = useState<'generate' | 'retouch' | 'enhance' | 'edit'>('generate')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL参数检测和模板加载
  useEffect(() => {
    const templateId = searchParams.get('template')
    if (templateId) {
      const template = getTemplateById(templateId)
      if (template) {
        setSelectedTemplate(template)
        setIsTemplateMode(true)
        
        // 应用模板设置
        const currentLang = pathname.startsWith('/zh') ? 'zh' : 'en'
        setGenerationMode(template.recommendedMode)
        setSelectedMode(template.optimalSettings.style)
        setIntensity(template.optimalSettings.intensity)
        
        // 设置提示词
        if (template.recommendedMode === 'image-to-image') {
          setPrompt(template.prompt[currentLang])
        } else {
          setTextPrompt(template.prompt[currentLang])
        }
        
        console.log('✅ 模版加载成功:', {
          templateId,
          title: template.title,
          mode: template.recommendedMode,
          prompt: template.prompt[currentLang]
        })
      } else {
        console.error('❌ 模版不存在:', templateId)
        // 如果模版不存在，使用默认的去水印模版
        const fallbackTemplate = getTemplateById('watermark-removal')
        if (fallbackTemplate) {
          setSelectedTemplate(fallbackTemplate)
          setIsTemplateMode(true)
          const currentLang = pathname.startsWith('/zh') ? 'zh' : 'en'
          setGenerationMode(fallbackTemplate.recommendedMode)
          setSelectedMode(fallbackTemplate.optimalSettings.style)
          setIntensity(fallbackTemplate.optimalSettings.intensity)
          if (fallbackTemplate.recommendedMode === 'image-to-image') {
            setPrompt(fallbackTemplate.prompt[currentLang])
          } else {
            setTextPrompt(fallbackTemplate.prompt[currentLang])
          }
        }
      }
    } else {
      // 没有模版参数时，设置默认的去水印模版
      const defaultTemplate = getTemplateById('watermark-removal')
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate)
        setIsTemplateMode(true)
        const currentLang = pathname.startsWith('/zh') ? 'zh' : 'en'
        setGenerationMode(defaultTemplate.recommendedMode)
        setSelectedMode(defaultTemplate.optimalSettings.style)
        setIntensity(defaultTemplate.optimalSettings.intensity)
        if (defaultTemplate.recommendedMode === 'image-to-image') {
          setPrompt(defaultTemplate.prompt[currentLang])
        } else {
          setTextPrompt(defaultTemplate.prompt[currentLang])
        }
        console.log('✅ 加载默认去水印模版')
      } else {
        setSelectedTemplate(null)
        setIsTemplateMode(false)
      }
    }
  }, [searchParams, pathname])

  // 持久化文件状态，避免登录后丢失
  useEffect(() => {
    if (status === 'authenticated' && file && !previewUrl) {
      // 重新创建预览URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [status, file, previewUrl])

  // 在登录状态变化时保持文件状态
  useEffect(() => {
    // 当从未认证变为已认证时，保持当前的文件状态
    if (status === 'authenticated' && previewUrl && file) {
      // 保持文件状态
    }
  }, [status])

  // 在用户登录时同步数据
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      // 🎯 Ultra-Think根本修复：直接调用，避免依赖refreshData导致循环
      refreshData().catch(console.error)
    }
  }, [status, session?.user?.email])

  // 获取用户可用模版列表
  useEffect(() => {
    const fetchAvailableTemplates = async () => {
      if (status === 'authenticated' && session?.user && (session.user as SessionUser).id) {
        setTemplateAccessChecking(true)
        try {
          const templates = await getUserAvailableTemplates((session.user as SessionUser).id)
          setAvailableTemplates(templates)
        } catch (error) {
          console.error('获取可用模版列表失败:', error)
          // 设置默认的免费模版
          setAvailableTemplates(['watermark-removal', 'body-optimization', 'tourist-removal'])
        } finally {
          setTemplateAccessChecking(false)
        }
      }
    }

    fetchAvailableTemplates()
  }, [status, session?.user])

  // 移除超时机制 - 创作区立即显示，不等待认证状态

  // 四种创作模式
  const allModes = [
    {
      id: 'classic',
      name: texts.classicMode || 'Classic',
      description: texts.classicDescription || 'Traditional balanced aesthetic style',
      color: 'from-purple-500 to-pink-500',
      requiredPlan: 'free',
      icon: Sparkles
    },
    {
      id: 'professional',
      name: texts.professionalMode || 'Professional',
      description: texts.professionalDescription || 'Refined professional style',
      color: 'from-blue-500 to-cyan-500',
      requiredPlan: 'free',
      icon: Star
    },
    {
      id: 'exaggerated',
      name: texts.exaggeratedMode || 'Expressive',
      description: texts.exaggeratedDescription || 'Bold and expressive style',
      color: 'from-red-500 to-orange-500',
      requiredPlan: 'standard',
      icon: Star
    },
    {
      id: 'creative',
      name: texts.creativeMode || 'Creative',
      description: texts.creativeDescription || 'Creative and imaginative style',
      color: 'from-green-500 to-blue-500',
      requiredPlan: 'free',
      icon: Zap
    }
  ]

  // 显示所有模式，但标记锁定状态
  const getAvailableModes = () => {
    return allModes // 显示全部3种风格
  }
  
  // 检查模式是否锁定
  const isModeLocker = (mode: any) => {
    if (mode.requiredPlan === 'free') return false
    
    if (!isSubscribed) return true
    
    const planHierarchy = { 'free': 0, 'standard': 1, 'pro': 2 }
    const userPlanLevel = planHierarchy[subscriptionPlan as keyof typeof planHierarchy] || 0
    const requiredLevel = planHierarchy[mode.requiredPlan as keyof typeof planHierarchy]
    
    return userPlanLevel < requiredLevel
  }

  const availableModes = getAvailableModes()
  const lockedModes = allModes.filter(mode => isModeLocker(mode))

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please select a JPG, PNG, or WebP image')
      return
    }
    setFile(selectedFile)
    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFileSelect(selectedFile)
  }

  const handleModeSwitch = (mode: 'text-to-image' | 'image-to-image') => {
    setGenerationMode(mode)
    setError(null)
    if (mode === 'text-to-image') {
      setFile(null)
      setPrompt('')
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } else {
      setTextPrompt('')
    }
  }

  const handleGenerate = async () => {
    console.log('🚀 开始生成图片，用户状态:', { 
      hasSession: !!session, 
      userEmail: session?.user?.email,
      mode: generationMode,
      textPrompt: textPrompt?.substring(0, 50) + '...',
      hasFile: !!file
    })

    if (!session) {
      console.error('❌ 用户未登录，引导用户登录')
      // 安全地跳转到登录页面
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname)
      }
      return
    }

    // 🎯 按需检查用量权限
    console.log('🔍 检查用量权限...')
    const permissionResult = await checkUsagePermission()
    console.log('📊 权限检查结果:', permissionResult)
    
    if (!permissionResult.allowed) {
      console.warn('⚠️ 用量权限检查失败:', permissionResult.reason)
      setError(permissionResult.reason || 'Generation limit reached. Please upgrade your plan to continue.')
      return
    }

    if (generationMode === 'text-to-image') {
      if (!textPrompt.trim()) {
        setError('Please enter a text prompt')
        return
      }
    } else {
      if (!file) {
        setError('Please select an image file')
        return
      }
    }

    setIsGenerating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('mode', generationMode)
      formData.append('taskType', taskType)

      if (generationMode === 'text-to-image') {
        formData.append('prompt', textPrompt || 'Create a Sybau style image')
      } else {
        formData.append('file', file!)
        formData.append('prompt', prompt || 'Transform this image into a Sybau style meme')
      }

      formData.append('style', selectedMode)
      formData.append('intensity', intensity.toString())

      // 准备API请求

      // Sending API request
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      // API response received

      if (response.ok) {
        // Image generation successful
        setGeneratedImage(data.imageUrl)
        setError(null)
        
        // 🎯 更新用量计数
        await updateUsageCount()
      } else {
        // Image generation failed
        setError(data.error || data.details || 'Failed to generate image. Please try again.')
      }
    } catch (error) {
      // Image generation error
      setError('Generation failed. Please check your network connection and try again.')
    } finally {
      setIsGenerating(false)
      // Generation process completed
    }
  }

  const handleDownload = async () => {
    if (generatedImage) {
      try {
        // 创建一个图片对象
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = async () => {
          // 创建canvas并绘制图片
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          canvas.width = img.width
          canvas.height = img.height
          
          // 绘制白色背景（JPG不支持透明度）
          ctx!.fillStyle = 'white'
          ctx!.fillRect(0, 0, canvas.width, canvas.height)
          
          // 绘制图片
          ctx!.drawImage(img, 0, 0)
          
          // 转换为JPG并下载
          canvas.toBlob(async (blob) => {
            if (blob) {
              const fileName = `sybau-generated-${Date.now()}.jpg`
              
              // 尝试使用File System Access API让用户选择保存位置
              if ('showSaveFilePicker' in window) {
                try {
                  const fileHandle = await (window as any).showSaveFilePicker({
                    suggestedName: fileName,
                    types: [
                      {
                        description: 'JPEG images',
                        accept: {
                          'image/jpeg': ['.jpg', '.jpeg'],
                        },
                      },
                    ],
                  })
                  
                  const writable = await fileHandle.createWritable()
                  await writable.write(blob)
                  await writable.close()
                  return
                } catch (error) {
                  // 用户取消选择或其他错误，回退到默认下载
                  console.log('User cancelled save or error:', error)
                }
              }
              
              // 回退到默认下载方式
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = fileName
              link.click()
              URL.revokeObjectURL(url)
            }
          }, 'image/jpeg', 0.95)
        }
        
        img.src = generatedImage
      } catch (error) {
        // 如果转换失败，直接下载原图
        const link = document.createElement('a')
        link.href = generatedImage
        link.download = `sybau-generated-${Date.now()}.jpg`
        link.click()
      }
    }
  }

  const resetGenerator = () => {
    setFile(null)
    setPrompt('')
    setTextPrompt('')
    setGeneratedImage(null)
    setError(null)
    setSelectedMode('classic')
    setIntensity(3)
    setGenerationMode('image-to-image')
    setTaskType('generate')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  // 模板选择处理函数
  const handleTemplateSelect = (template: TemplateData) => {
    setSelectedTemplate(template)
    setIsTemplateMode(true)
    
    // 应用模板设置
    const currentLang = pathname.startsWith('/zh') ? 'zh' : 'en'
    setGenerationMode(template.recommendedMode)
    setSelectedMode(template.optimalSettings.style)
    setIntensity(template.optimalSettings.intensity)
    
    // 设置提示词
    if (template.recommendedMode === 'image-to-image') {
      setPrompt(template.prompt[currentLang])
    } else {
      setTextPrompt(template.prompt[currentLang])
    }
    
    setShowTemplateLibrary(false)
  }

  // 移除认证状态阻塞 - 创作区应该立即显示，只在生成时鉴权

  // 🔧 添加调试信息
  console.log('🎨 ImageGenerator渲染状态:', { 
    status, 
    hasSession: !!session, 
    userEmail: session?.user?.email,
    usageCount,
    maxUsage,
    subscriptionPlan,
    isSubscribed
  })

  return (
    <div className="bg-blue-50 p-4 rounded-xl min-h-[400px]">
      {/* 顶部模式切换 - 蓝色主题 */}
      <div className="bg-blue-100 rounded-lg p-3 mb-4">
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => handleModeSwitch('image-to-image')}
            className={`h-10 px-6 text-sm font-medium rounded-lg transition-all border-2 ${
              generationMode === 'image-to-image' 
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
            }`}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            {texts.imageMode || 'Image'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleModeSwitch('text-to-image')}
            className={`h-10 px-6 text-sm font-medium rounded-lg transition-all border-2 ${
              generationMode === 'text-to-image' 
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
            }`}
          >
            <Type className="w-4 h-4 mr-2" />
            {texts.textMode || 'Text'}
          </Button>
        </div>
      </div>

      {/* 主要内容区域 - 条件渲染 */}
      <div className="bg-white border border-blue-200 shadow-lg rounded-lg overflow-hidden">
        <div className="p-4">

          {/* 条件渲染：文生图全宽 vs 图生图分区 */}
          <div className="grid grid-cols-12 gap-4">
            {generationMode === 'text-to-image' ? (
              /* 文生图模式：全宽大输入框 */
              <div className="col-span-12">
                <div className="space-y-3">
                  <Textarea
                    placeholder={texts.textPromptPlaceholder || 'Please describe what you want to generate, focus on the subject, for example: a brown dolphin with curled tail, cartoon style'}
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    className="w-full h-48 resize-none border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm leading-relaxed p-3"
                  />
                  <div className="flex justify-end items-center text-sm">
                    <span className="text-blue-400">{textPrompt.length}/150</span>
                  </div>
                </div>
              </div>
            ) : (
              /* 图生图模式：左右分区 + 箭头指示 */
              <>
                {/* 左侧：案例展示区 - 4栅格 */}
                <div className="col-span-4">
                  {generatedImage ? (
                    <div>
                      <div className="aspect-square bg-blue-50 rounded-lg overflow-hidden border border-blue-200">
                        <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        // 获取要显示的模版：用户选择的模版 或 默认的watermark-removal模版
                        const displayTemplate = selectedTemplate || getTemplateById('watermark-removal')
                        
                        if (!displayTemplate) return null
                        
                        return (
                          <>
                            <div className="text-center mb-2">
                              <h3 className="text-sm font-bold text-blue-800 mb-1">
                                {pathname.startsWith('/zh') ? displayTemplate.title.zh : displayTemplate.title.en}
                              </h3>
                              <p className="text-xs text-blue-600">
                                {pathname.startsWith('/zh') ? displayTemplate.description.zh : displayTemplate.description.en}
                              </p>
                            </div>
                            
                            {/* Before/After 对比 - 蓝色主题 */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="aspect-square bg-blue-50 rounded-lg overflow-hidden relative border border-blue-200">
                                <img src={displayTemplate.beforeImage} alt="Before" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                                    {pathname.startsWith('/zh') ? '处理前' : 'Before'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="aspect-square bg-blue-50 rounded-lg overflow-hidden relative border border-blue-200">
                                <img src={displayTemplate.afterImage} alt="After" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                                    {pathname.startsWith('/zh') ? '处理后' : 'After'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>

                {/* 中间：箭头指示 - 1栅格 */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className="flex items-center justify-center h-full">
                    <ArrowRight className="w-10 h-10 text-blue-500 animate-pulse stroke-2" />
                  </div>
                </div>

                {/* 右侧：操作区 - 7栅格 */}
                <div className="col-span-7">
                  <div className="space-y-3">
                    <div
                      className={`border-2 border-dashed rounded-lg h-52 text-center transition-all cursor-pointer group flex flex-col justify-center ${
                        isDragging ? 'border-blue-400 bg-blue-100' : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      {file && previewUrl ? (
                        <div className="relative">
                          <img src={previewUrl} alt="Preview" className="max-w-full max-h-40 object-contain rounded-lg mx-auto border border-blue-200" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              resetGenerator()
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-md"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="text-sm font-medium text-blue-700 mt-2 truncate">{file.name}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto group-hover:bg-blue-700 transition-colors">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-blue-700 mb-1">🖼️ {texts.dragImageHere || 'Drag image here'}</p>
                            <p className="text-sm text-blue-500">{texts.orClickToSelect || 'or click to select file'}</p>
                            <p className="text-xs text-blue-400 mt-2">{texts.supportedFormatsShort || 'Support JPG, PNG, WebP • Max 5MB'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 可选描述输入 */}
                    <Input
                      placeholder={texts.styleOptional || 'Optional: describe desired style changes...'}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-10"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
        
        {/* 底部控制条 - 蓝色主题优化布局 */}
        <div className="border-t border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center justify-between gap-4">
            {/* 左侧：模板库按钮 */}
            <div className="flex-shrink-0">
              <button 
                onClick={() => setShowTemplateLibrary(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                  <Target className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="font-medium">{texts.templateLibrary || 'Template Library'}</span>
              </button>
            </div>
            
            {/* 中间：处理强度选择 - 紧凑布局 */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              <span className="text-blue-600 text-sm font-medium">{texts.style || 'Style'}</span>
              <div className="flex gap-1">
                {availableModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      selectedMode === mode.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 右侧：Generate按钮 - 紧凑版本 */}
            <div className="flex-shrink-0">
              <Button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  (generationMode === 'text-to-image' && !textPrompt.trim()) ||
                  (generationMode === 'image-to-image' && !file)
                }
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center min-w-[120px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {texts.generating || 'Generating...'}
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎨</span>
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      
      {/* 错误提示 - 蓝色主题 */}
      {error && !error.includes('Please log in') && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      {/* 加载状态显示 */}
      {isGenerating && (
        <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-3"></div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700">{texts.creationInProgress || 'AI is creating...'}</p>
              <p className="text-xs text-blue-500">{texts.creationWait || 'Please wait, estimated 15-30 seconds'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 下载和重新创作按钮 */}
      {generatedImage && (
        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleDownload}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg h-10 text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            {texts.downloadImage || 'Download'}
          </Button>
          <Button
            onClick={resetGenerator}
            variant="outline" 
            className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-lg h-10 text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {texts.recreate || 'Create Again'}
          </Button>
        </div>
      )}

      {/* 模板库弹窗 */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* 弹窗标题栏 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">{texts.templateLibrary || 'Template Library'}</h3>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  {Object.keys(templateData).length} {texts.templatesCount || 'Templates'}
                </Badge>
              </div>
              <button
                onClick={() => setShowTemplateLibrary(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* 模板网格 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(templateData).map((template) => {
                  const isAccessible = availableTemplates.includes(template.id)
                  const isLocked = !isAccessible
                  
                  return (
                    <div
                      key={template.id}
                      className={`bg-gray-50 rounded-xl overflow-hidden transition-all group relative ${
                        isLocked 
                          ? 'opacity-60 cursor-not-allowed' 
                          : 'hover:shadow-lg cursor-pointer'
                      }`}
                      onClick={() => isAccessible ? handleTemplateSelect(template) : null}
                    >
                      {/* 锁定遮罩 */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-xl">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 text-center">
                            <Lock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600 font-medium">{texts.needUpgrade || 'Upgrade Required'}</p>
                            <Link href="/billing" className="text-xs text-blue-600 hover:underline">
                              {texts.upgradeNow || 'Upgrade Now'}
                            </Link>
                          </div>
                        </div>
                      )}
                    {/* Before/After 预览 */}
                    <div className="aspect-video bg-white p-2">
                      <BeforeAfterSlider
                        beforeImage={template.beforeImage}
                        afterImage={template.afterImage}
                        beforeLabel="Before"
                        afterLabel="After"
                        width={300}
                        height={200}
                        className="rounded-lg overflow-hidden"
                      />
                    </div>
                    
                    {/* 模板信息 */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${ 
                          template.category === 'life-enhancement' ? 'bg-green-100 text-green-700' :
                          template.category === 'business-creation' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {categoryInfo[template.category][pathname.startsWith('/zh') ? 'zh' : 'en']}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {template.processingTime[pathname.startsWith('/zh') ? 'zh' : 'en']}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {template.title[pathname.startsWith('/zh') ? 'zh' : 'en']}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description[pathname.startsWith('/zh') ? 'zh' : 'en']}
                      </p>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
