'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface AuthDebugInfo {
  sessionStatus: string
  sessionData: any
  cookies: Record<string, string>
  localStorage: Record<string, string>
  databaseCheck: {
    tablesExist: string[]
    connectionStatus: string
  }
}

export default function AuthDebugPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null)
  const [envInfo, setEnvInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const gatherDebugInfo = async () => {
      try {
        // クッキー情報を取得
        const cookieEntries = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
          const [key, value] = cookie.trim().split('=')
          if (key) acc[key] = value || ''
          return acc
        }, {})

        // ローカルストレージ情報を取得
        const localStorageEntries: Record<string, string> = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) localStorageEntries[key] = localStorage.getItem(key) || ''
        }

        // データベース状態をチェック
        const dbResponse = await fetch('/api/debug/database')
        const dbData = await dbResponse.json()

        // サーバーサイド環境変数をチェック
        const envResponse = await fetch('/api/debug/env')
        const envData = await envResponse.json()

        const info: AuthDebugInfo = {
          sessionStatus: status,
          sessionData: session,
          cookies: cookieEntries,
          localStorage: localStorageEntries,
          databaseCheck: dbData
        }

        setDebugInfo(info)
        setEnvInfo(envData)
      } catch (error) {
        console.error('Debug info gathering failed:', error)
      } finally {
        setLoading(false)
      }
    }

    gatherDebugInfo()
  }, [session, status])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">NextAuth Debug Info</h1>
          <p>Loading debug information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">NextAuth Debug Info</h1>
        
        <div className="space-y-6">
          {/* Session Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Status:</span> {debugInfo?.sessionStatus}</p>
              <div>
                <span className="font-medium">Session Data:</span>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo?.sessionData, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <div className="space-y-2">
              {Object.entries(debugInfo?.cookies || {}).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <p><span className="font-medium">{key}:</span></p>
                  <p className="text-sm text-gray-600 break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Database Status</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Connection:</span> {debugInfo?.databaseCheck.connectionStatus}</p>
              <div>
                <span className="font-medium">Tables:</span>
                <ul className="mt-2 list-disc list-inside">
                  {debugInfo?.databaseCheck.tablesExist?.map((table) => (
                    <li key={table} className="text-sm">{table}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Server Environment Variables</h2>
            <div className="space-y-2">
              <p><span className="font-medium">NEXTAUTH_URL:</span> 
                <span className={envInfo?.NEXTAUTH_URL === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                  {envInfo?.NEXTAUTH_URL || 'Loading...'}
                </span>
              </p>
              <p><span className="font-medium">NEXTAUTH_SECRET:</span> 
                <span className={envInfo?.NEXTAUTH_SECRET === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                  {envInfo?.NEXTAUTH_SECRET || 'Loading...'}
                </span>
              </p>
              <p><span className="font-medium">DATABASE_URL:</span> 
                <span className={envInfo?.DATABASE_URL === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                  {envInfo?.DATABASE_URL || 'Loading...'}
                </span>
              </p>
              <p><span className="font-medium">Request Host:</span> {envInfo?.requestHost || 'Loading...'}</p>
              <p><span className="font-medium">Request Protocol:</span> {envInfo?.requestProtocol || 'Loading...'}</p>
              <p><span className="font-medium">Node ENV:</span> {envInfo?.NODE_ENV || 'Loading...'}</p>
              
              {envInfo?.NEXTAUTH_URL === 'NOT SET' && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                  <p className="text-red-800 font-medium">⚠️ NEXTAUTH_URL is not set!</p>
                  <p className="text-sm text-red-600">This is likely causing the authentication loop issue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}