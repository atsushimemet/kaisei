'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function TestSessionPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
    console.log(`[Session Test] ${timestamp}: ${message}`)
  }

  useEffect(() => {
    addLog(`Session status changed to: ${status}`)
    if (session) {
      addLog(`Session data: ${JSON.stringify({
        user: session.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        } : null,
        expires: session.expires
      }, null, 2)}`)
    }
  }, [session, status])

  const handleGoogleSignIn = async () => {
    addLog('Initiating Google sign in...')
    try {
      const result = await signIn('google', { 
        callbackUrl: '/auth/test-session',
        redirect: false // 手動でリダイレクト処理を確認
      })
      addLog(`Sign in result: ${JSON.stringify(result)}`)
    } catch (error) {
      addLog(`Sign in error: ${error}`)
    }
  }

  const handleSignOut = async () => {
    addLog('Signing out...')
    await signOut({ callbackUrl: '/auth/test-session' })
  }

  const checkSession = async () => {
    addLog('Manual session check...')
    try {
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      addLog(`Manual session data: ${JSON.stringify(sessionData)}`)
    } catch (error) {
      addLog(`Manual session check error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">NextAuth Session Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> <span className={status === 'authenticated' ? 'text-green-600' : status === 'loading' ? 'text-yellow-600' : 'text-red-600'}>{status}</span></p>
            <p><strong>User:</strong> {session?.user?.email || 'None'}</p>
            <p><strong>Expires:</strong> {session?.expires || 'None'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={handleGoogleSignIn}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              disabled={status === 'loading'}
            >
              Sign in with Google
            </button>
            <button 
              onClick={handleSignOut}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              disabled={status !== 'authenticated'}
            >
              Sign Out
            </button>
            <button 
              onClick={checkSession}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Check Session
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Session Logs</h2>
          <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}