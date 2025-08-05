'use client'

import { Home, List, LogOut, Settings, User, Zap } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSettingsClick = () => {
    // 設定画面への移動であることを示すフラグを設定
    localStorage.setItem('navigatingToSettings', 'true')
    localStorage.setItem('fromNewEventPage', 'true')
    console.log('🔗 [Header] 設定画面への移動フラグを設定しました')
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xl font-semibold">飲み会精算アプリ</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/events/new/quick" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">クイック精算</span>
            </Link>
            
            <Link 
              href="/events" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <List className="w-5 h-5" />
              <span className="text-sm font-medium">一覧</span>
            </Link>
            
            <Link 
              href="/settings" 
              onClick={handleSettingsClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">設定</span>
            </Link>
            
            {status === 'authenticated' && session?.user && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {session.user.name || session.user.email}
                  </span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{session.user.name}</div>
                      <div className="text-gray-500">{session.user.email}</div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ログアウト</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {status === 'unauthenticated' && (
              <Link
                href="/auth/signin"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">ログイン</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* メニュー外クリックで閉じる */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  )
} 
