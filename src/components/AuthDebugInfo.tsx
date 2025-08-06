'use client'

import { useSession } from 'next-auth/react'

export default function AuthDebugInfo() {
  const { data: session, status } = useSession()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-900 text-white text-xs rounded-lg max-w-sm overflow-auto max-h-96 z-50">
      <h3 className="font-bold mb-2">NextAuth Debug Info</h3>
      <div className="space-y-2">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Session:</strong>
          <pre className="bg-gray-800 p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        <div>
          <strong>Browser Info:</strong>
          <pre className="bg-gray-800 p-2 rounded mt-1 overflow-auto">
            {JSON.stringify({
              userAgent: navigator.userAgent.substring(0, 50) + '...',
              cookieEnabled: navigator.cookieEnabled,
              protocol: window.location.protocol,
              hostname: window.location.hostname,
              port: window.location.port,
            }, null, 2)}
          </pre>
        </div>
        <div>
          <strong>Cookies:</strong>
          <pre className="bg-gray-800 p-2 rounded mt-1 overflow-auto">
            {document.cookie.split(';').filter(cookie => 
              cookie.includes('next-auth') || cookie.includes('__Secure') || cookie.includes('__Host')
            ).join('\n')}
          </pre>
        </div>
      </div>
    </div>
  )
}