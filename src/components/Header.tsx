'use client'

import { Home, List, Settings } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const handleSettingsClick = () => {
    // 設定画面への移動であることを示すフラグを設定
    localStorage.setItem('navigatingToSettings', 'true')
    localStorage.setItem('fromNewEventPage', 'true')
    console.log('🔗 [Header] 設定画面への移動フラグを設定しました')
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
          </div>
        </div>
      </div>
    </header>
  )
} 
