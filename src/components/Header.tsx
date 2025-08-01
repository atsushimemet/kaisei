'use client'

import { Home, Settings } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
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
          
          <Link 
            href="/settings" 
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">設定</span>
          </Link>
        </div>
      </div>
    </header>
  )
} 
