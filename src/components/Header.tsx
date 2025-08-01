'use client'

import { Home } from 'lucide-react'
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
        </div>
      </div>
    </header>
  )
} 
