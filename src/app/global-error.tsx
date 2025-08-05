'use client'
import { useEffect } from 'react'
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <html>
      <body>
        <div>
          <h2>システムエラーが発生しました</h2>
          <button onClick={reset}>再試行</button>
        </div>
      </body>
    </html>
  )
} 
