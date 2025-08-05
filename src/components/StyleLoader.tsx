'use client'

import { useEffect, useState } from 'react'

export default function StyleLoader({ children }: { children: React.ReactNode }) {
  const [stylesLoaded, setStylesLoaded] = useState(false)

  useEffect(() => {
    // Wait for styles to be loaded
    const checkStyles = () => {
      // Check if Tailwind classes are properly applied
      const testElement = document.createElement('div')
      testElement.className = 'bg-gray-50'
      document.body.appendChild(testElement)
      
      const computedStyle = window.getComputedStyle(testElement)
      const bgColor = computedStyle.backgroundColor
      
      document.body.removeChild(testElement)
      
      // If Tailwind CSS is loaded, bg-gray-50 should have a specific background color
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        setStylesLoaded(true)
      } else {
        // Retry after a short delay
        setTimeout(checkStyles, 50)
      }
    }

    // Initial check
    if (document.readyState === 'complete') {
      checkStyles()
    } else {
      window.addEventListener('load', checkStyles)
      return () => window.removeEventListener('load', checkStyles)
    }
  }, [])

  if (!stylesLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          読み込み中...
        </div>
      </div>
    )
  }

  return <>{children}</>
}