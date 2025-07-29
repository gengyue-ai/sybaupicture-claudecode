// Global type definitions for external libraries

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent' | 'get',
      targetId: string,
      config?: {
        page_path?: string
        page_title?: string
        page_location?: string
        [key: string]: any
      }
    ) => void
  }
}

export {}