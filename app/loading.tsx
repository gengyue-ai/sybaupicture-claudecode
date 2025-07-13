import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* 加载动画 */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* 加载文本 */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Loading...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we prepare your content
          </p>
        </div>

        {/* 进度指示器 */}
        <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-primary rounded-full loading-progress"></div>
        </div>
      </div>

      <style>
        {`
        .loading-progress {
          animation: loading-progress 2s ease-in-out infinite;
        }
        
        @keyframes loading-progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        `}
      </style>
    </div>
  )
} 