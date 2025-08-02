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
        
        /* 响应式断点优化 */
        @media (max-width: 640px) {
          .container { padding: 0 1rem; }
          .cta-primary { font-size: 0.9rem; padding: 0.75rem 1.5rem; }
        }
      `
    }} />
  )
}