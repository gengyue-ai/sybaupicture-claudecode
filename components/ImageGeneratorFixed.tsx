'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, Wand2, Sparkles, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react'

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
  }
}

export default function ImageGeneratorFixed({ texts }: ImageGeneratorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedMode, setSelectedMode] = useState('classic')
  const [intensity, setIntensity] = useState(3)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const modes = [
    {
      id: 'classic',
      name: texts.classicMode || '经典Sybau',
      description: texts.classicDescription || '传统Sybau风格，平衡的幽默感',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'exaggerated',
      name: texts.exaggeratedMode || '夸张Sybau',
      description: texts.exaggeratedDescription || '夸张表情，最大化冲击力',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'professional',
      name: texts.professionalMode || '专业Sybau',
      description: texts.professionalDescription || '适合商务使用的微妙Sybau风格',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'creative',
      name: texts.creativeMode || '创意Sybau',
      description: texts.creativeDescription || '独特创意的艺术诠释',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      setError('文件大小必须小于5MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('请选择JPG、PNG或WebP格式的图片')
      return
    }

    setFile(selectedFile)
    setError(null)

    // 创建预览URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
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
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleGenerate = async () => {
    if (!file && !prompt) {
      setError('请上传图片或输入提示词')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      }
      formData.append('prompt', prompt || 'Create a Sybau Lazer Dim 700 style meme')
      formData.append('mode', selectedMode)
      formData.append('intensity', intensity.toString())

      console.log('Sending request to /api/generate with:', {
        hasFile: !!file,
        prompt: prompt || 'Create a Sybau Lazer Dim 700 style meme',
        mode: selectedMode,
        intensity: intensity
      })

      // 添加超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒超时

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('API response:', result)

      if (result.success) {
        setGeneratedImage(result.imageUrl)
      } else {
        setError(result.error || '生成失败')
      }
    } catch (err) {
      console.error('Generation error:', err)

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('请求超时，请重试')
        } else if (err.message.includes('fetch')) {
          setError('网络连接失败，请检查网络后重试')
        } else if (err.message.includes('HTTP error')) {
          setError('服务器错误，请稍后重试')
        } else {
          setError(`生成失败: ${err.message}`)
        }
      } else {
        setError('未知错误，请重试')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `sybau-${selectedMode}-${intensity}-generated.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const resetGenerator = () => {
    setFile(null)
    setPrompt('')
    setGeneratedImage(null)
    setError(null)
    setSelectedMode('classic')
    setIntensity(3)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 清理预览URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      {/* Upload Section */}
      <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
        <CardHeader className="text-center">
          <Upload className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <CardTitle className="text-2xl text-purple-800">{texts.uploadTitle}</CardTitle>
          <CardDescription className="text-gray-600">
            {texts.uploadDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center bg-white/50 transition-colors cursor-pointer ${
              isDragging ? 'border-purple-400 bg-purple-50' : 'border-purple-200'
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
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        resetGenerator()
                      }}
                      className="bg-white/80 backdrop-blur-sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-700">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-16 w-16 text-purple-400 mx-auto" />
                <p className="text-lg font-medium text-gray-700">{texts.dragAndDrop}</p>
                <p className="text-sm text-gray-500">{texts.clickToBrowse}</p>
                <p className="text-xs text-gray-400">
                  {texts.supportedFormats} • {texts.maxFileSize}
                </p>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium text-gray-700">
              {texts.promptLabel}
            </Label>
            <Input
              id="prompt"
              type="text"
              placeholder={texts.promptPlaceholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings & Results Section */}
      <Card className="p-8 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-100">
        <CardHeader className="text-center">
          <Wand2 className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
          <CardTitle className="text-2xl text-cyan-800">{texts.settingsTitle}</CardTitle>
          <CardDescription className="text-gray-600">
            {texts.settingsDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              {texts.modeLabel || '模式选择'}
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {modes.map((mode) => (
                <Button
                  key={mode.id}
                  variant={selectedMode === mode.id ? "default" : "outline"}
                  className={`p-4 h-auto border-2 transition-all ${
                    selectedMode === mode.id
                      ? `bg-gradient-to-r ${mode.color} text-white border-transparent shadow-lg`
                      : 'border-cyan-200 bg-white text-gray-700'
                  }`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">{mode.name}</div>
                    <div className={`text-xs ${selectedMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {mode.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              {texts.intensityLabel || '强度等级'} ({intensity}/5)
            </Label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="5"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((intensity - 1) / 4) * 100}%, #e5e7eb ${((intensity - 1) / 4) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>微妙</span>
                <span>中等</span>
                <span>强烈</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!file && !prompt)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {texts.generating}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {texts.generateButton}
              </>
            )}
          </Button>

          {/* Generated Image Display */}
          {generatedImage && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                <img
                  src={generatedImage}
                  alt="Generated Sybau meme"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <div className="mt-3 flex justify-between items-center">
                  <Badge className={`bg-gradient-to-r ${modes.find(m => m.id === selectedMode)?.color} text-white`}>
                    {modes.find(m => m.id === selectedMode)?.name}
                  </Badge>
                  <span className="text-sm text-gray-500">强度: {intensity}/5</span>
                </div>
              </div>
              <Button
                onClick={handleDownload}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 text-lg font-semibold rounded-xl transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                {texts.downloadButton}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
