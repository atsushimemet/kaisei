'use client'

import { Home, List, LogOut, Menu, Settings, User, X, Zap } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSettingsClick = () => {
    // 設定画面への移動であることを示すフラグを設定
    localStorage.setItem('navigatingToSettings', 'true')
    localStorage.setItem('fromNewEventPage', 'true')
    console.log('🔗 [Header] 設定画面への移動フラグを設定しました')
    setIsMenuOpen(false) // メニューを閉じる
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    setIsUserMenuOpen(false) // メニューを閉じる
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ・アプリ名 */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-lg font-semibold sm:text-xl">飲み会精算アプリ</span>
          </Link>
          
          {/* デスクトップ用メニュー */}
          <div className="hidden md:flex items-center space-x-4">
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
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {session.user.name || session.user.email}
                  </span>
                </button>

                {isUserMenuOpen && (
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

          {/* スマホ用ハンバーガーメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="メニューを開く"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* スマホ用ハンバーガーメニュー */}
      {isMenuOpen && (
        <div className="md:hidden">
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
          />
          
          {/* メニューパネル */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
                <button
                  onClick={closeMenu}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <nav className="p-4">
              <div className="space-y-2">
                {/* クイック精算 */}
                <Link
                  href="/events/new/quick"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">クイック精算</span>
                </Link>

                {/* 一覧 */}
                <Link
                  href="/events"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <List className="w-5 h-5 text-green-600" />
                  <span className="font-medium">一覧</span>
                </Link>

                {/* 設定 */}
                <Link
                  href="/settings"
                  onClick={handleSettingsClick}
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">設定</span>
                </Link>

                {/* ユーザー情報・ログイン */}
                {status === 'authenticated' && session?.user ? (
                  <div className="border-t pt-4 mt-4">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      ログイン中
                    </div>
                    <div className="px-3 py-2 text-sm font-medium text-gray-900">
                      {session.user.name || session.user.email}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5 text-red-600" />
                      <span className="font-medium">ログアウト</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t pt-4 mt-4">
                    <Link
                      href="/auth/signin"
                      onClick={closeMenu}
                      className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">ログイン</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* デスクトップ用ユーザーメニュー外クリックで閉じる */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  )
} 
