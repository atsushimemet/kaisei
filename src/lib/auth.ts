import { getPrisma } from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { debugLog, debugError, debugDatabase } from "@/lib/debug-auth"

// PrismaAdapterを動的に初期化
const getPrismaAdapter = () => {
  try {
    if (!process.env.DATABASE_URL) {
      debugLog('PrismaAdapter Init', { error: 'DATABASE_URL not set' })
      return undefined
    }
    
    debugLog('PrismaAdapter Init', { 
      databaseUrl: process.env.DATABASE_URL.substring(0, 30) + '...',
      nodeEnv: process.env.NODE_ENV 
    })
    
    const prisma = getPrisma()
    
    // データベース接続とテーブル確認（非同期処理）
    debugDatabase(prisma).catch(error => {
      debugError('Database Debug', error)
    })
    
    const adapter = PrismaAdapter(prisma)
    
    debugLog('PrismaAdapter Init', { status: 'success' })
    return adapter
  } catch (error) {
    debugError('PrismaAdapter Init', error)
    return undefined
  }
}

export const authOptions: NextAuthOptions = {
  // JWT戦略使用時はadapterを使わず、手動でユーザー情報を管理
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // 開発環境でのHTTPS判定を無効化
  useSecureCookies: false,
  callbacks: {
    session: async ({ session, token }) => {
      debugLog('Session Callback', { 
        hasSession: !!session,
        hasToken: !!token,
        userId: token?.sub,
        userEmail: session?.user?.email
      })
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: async ({ user, token, account, profile, isNewUser }) => {
      debugLog('JWT Callback', { 
        hasUser: !!user,
        hasToken: !!token,
        hasAccount: !!account,
        accountProvider: account?.provider,
        isNewUser,
        userId: user?.id || token?.sub
      })
      if (user) {
        token.uid = user.id
      }
      return token
    },
    signIn: async ({ user, account, profile }) => {
      debugLog('SignIn Callback', {
        hasUser: !!user,
        hasAccount: !!account,
        provider: account?.provider,
        userEmail: user?.email,
        profileEmail: profile?.email,
        accountId: account?.providerAccountId,
        userId: user?.id
      })
      
      // JWT戦略で手動ユーザー管理（オプション）
      if (account && user) {
        try {
          const prisma = getPrisma()
          
          // ユーザーが存在するかチェック
          const existingUser = await prisma.users.findUnique({
            where: { email: user.email! }
          })
          
          if (!existingUser && user.email) {
            // 新規ユーザーの場合のみDB保存
            await prisma.users.create({
              data: {
                id: user.id || crypto.randomUUID(),
                email: user.email,
                name: user.name,
                image: user.image,
                email_verified: null,
                created_at: new Date(),
                updated_at: new Date()
              }
            })
            debugLog('SignIn New User Created', { email: user.email })
          } else {
            debugLog('SignIn Existing User', { email: user.email })
          }
          
        } catch (error) {
          debugError('SignIn Database Operation', error)
          // データベースエラーでも認証は継続（JWT戦略なので）
        }
      }
      
      return true
    },
    redirect: async ({ url, baseUrl }) => {
      debugLog('Redirect Callback', { url, baseUrl })
      // 開発環境でのリダイレクト処理を簡素化
      let redirectUrl = baseUrl
      if (url.startsWith('/')) {
        redirectUrl = `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        redirectUrl = url
      }
      debugLog('Redirect Decision', { originalUrl: url, finalUrl: redirectUrl })
      return redirectUrl
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // 開発環境ではfalse
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: false, // 開発環境ではfalse
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // 開発環境ではfalse
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === 'development',
}
