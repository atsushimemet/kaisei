// 環境変数確認スクリプト
require('dotenv').config()

console.log('🔍 Environment Variables Check:')
console.log('================================')

const requiredEnvs = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET', 
  'DATABASE_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
]

let allSet = true

requiredEnvs.forEach(envName => {
  const value = process.env[envName]
  const status = value ? '✅' : '❌'
  const displayValue = value ? 
    (envName.includes('SECRET') || envName.includes('DATABASE_URL') ? 
      value.substring(0, 10) + '...' : value) : 
    'NOT SET'
  
  console.log(`${status} ${envName}: ${displayValue}`)
  
  if (!value) allSet = false
})

console.log('================================')
console.log(`Overall Status: ${allSet ? '✅ All set' : '❌ Missing variables'}`)

if (!allSet) {
  console.log('\n🚨 Fix required:')
  console.log('1. Check if .env file exists')
  console.log('2. Restart the development server')
  console.log('3. Verify file permissions')
}