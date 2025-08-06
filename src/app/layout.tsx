import ClientLogger from '@/components/ClientLogger'
import Header from '@/components/Header'
import SessionProvider from '@/components/SessionProvider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KAISEI - 飲み会精算支援アプリ',
  description: '3〜6人規模の飲み会に特化した精算支援アプリ。幹事の負担を軽減し、透明性のある精算を実現します。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GHMYB7WRCE"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GHMYB7WRCE');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ClientLogger componentName="RootLayout" />
          <div className="min-h-screen bg-gray-50">
            <Header />
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
} 
