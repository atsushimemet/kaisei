'use client'

import { useEffect } from 'react'

interface ClientLoggerProps {
  componentName: string
}

export default function ClientLogger({ componentName }: ClientLoggerProps) {
  useEffect(() => {
    // 開発環境でのみログを出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [${componentName}] コンポーネントがマウントされました`)
      console.log(`🌐 [${componentName}] ブラウザ環境で実行中`)
    }
  }, [componentName])

  return null // このコンポーネントは何も表示しない
} 
