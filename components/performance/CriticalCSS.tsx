// 关键CSS内联组件 - 首屏渲染优化
export function CriticalCSS() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* 关键路径CSS - 仅首屏必需样式 */
        body { font-family: Inter, sans-serif; margin: 0; font-display: swap; }
        * { box-sizing: border-box; }
        
        /* 首屏hero区域优化 */
        .min-h-screen { min-height: 100vh; contain: layout style; }
        .bg-gradient-to-br { 
          background: linear-gradient(135deg, #faf5ff 0%, #ffffff 50%, #ecfeff 100%);
          will-change: auto;
        }
        
        /* 关键按钮样式 - 预定义避免重绘 */
        .cta-primary { 
          background: linear-gradient(135deg, #9333ea 0%, #db2777 100%);
          color: white;
          border-radius: 9999px;
          transition: transform 0.15s ease;
          contain: paint;
        }
        .cta-primary:hover { transform: scale(1.02); }
        
        /* 骨架屏动画优化 */
        .animate-pulse { 
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          contain: layout style paint;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        /* 图片容器防止CLS */
        .image-container {
          aspect-ratio: 3/2;
          background: #f3f4f6;
          contain: layout;
        }
        
        /* 移动端优先的响应式优化 */
        @media (max-width: 480px) {
          /* 极小屏幕优化 */
          body { font-size: 14px; }
          .min-h-screen { min-height: 100vh; min-height: 100svh; }
          .container { padding: 0 0.75rem; }
          .cta-primary { 
            font-size: 0.85rem; 
            padding: 0.7rem 1.2rem;
            /* 保留轻微的hover效果，不完全禁用 */
          }
          /* 移动端图片容器优化 */
          .image-container {
            aspect-ratio: 4/3; /* 移动端使用更合适的比例 */
            background: linear-gradient(45deg, #f3f4f6 25%, transparent 25%);
          }
        }
        
        @media (max-width: 640px) and (min-width: 481px) {
          /* 中等移动屏幕 */
          .container { padding: 0 1rem; }
          .cta-primary { font-size: 0.9rem; padding: 0.75rem 1.5rem; }
        }
        
        @media (max-width: 768px) {
          /* 所有移动端通用优化 */
          * { 
            -webkit-tap-highlight-color: rgba(0,0,0,0.1); /* 保留轻微点击反馈 */
            -webkit-font-smoothing: antialiased; /* 字体平滑 */
          }
          
          /* 减少移动端重绘 */
          .bg-gradient-to-br {
            background-attachment: scroll; /* 移动端不使用fixed */
          }
          
          /* 移动端hover优化而不是完全禁用 */
          .cta-primary:hover { 
            transform: scale(1.01); /* 保留轻微缩放效果 */
          }
        }
      `
    }} />
  )
}