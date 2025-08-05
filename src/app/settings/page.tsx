'use client'

import { DEFAULT_SETTLEMENT_RULES, SettlementRules } from '@/types'
import { ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const router = useRouter()
  const [rules, setRules] = useState<SettlementRules>(DEFAULT_SETTLEMENT_RULES)
  const [saved, setSaved] = useState(false)
  const [fromNewEventPage, setFromNewEventPage] = useState(false)

  useEffect(() => {
    // ローカルストレージから設定を読み込み
    const savedRules = localStorage.getItem('settlementRules')
    console.log('Loading settings from localStorage:', savedRules)
    if (savedRules) {
      try {
        const parsed = JSON.parse(savedRules)
        console.log('Parsed settings:', parsed)
        setRules(parsed)
      } catch (error) {
        console.error('Error parsing saved rules:', error)
        setRules(DEFAULT_SETTLEMENT_RULES)
      }
    } else {
      console.log('No saved settings found, using defaults')
    }

    // 新しい飲み会作成画面から来たかどうかをチェック
    const fromNewEvent = localStorage.getItem('fromNewEventPage') === 'true'
    const navigatingToSettings = localStorage.getItem('navigatingToSettings') === 'true'
    
    console.log('🔍 [SettingsPage] フラグ確認:')
    console.log('- fromNewEventPage:', fromNewEvent)
    console.log('- navigatingToSettings:', navigatingToSettings)
    
    // 新しい飲み会作成画面から来た場合のみ戻るボタンを表示
    if (fromNewEvent || navigatingToSettings) {
      setFromNewEventPage(true)
      console.log('✅ [SettingsPage] 新しい飲み会作成画面から来ました')
    } else {
      setFromNewEventPage(false)
      console.log('ℹ️ [SettingsPage] 直接アクセスまたは他の画面から来ました')
    }
    
    // フラグをクリア（ただし、fromNewEventPageは保持）
    localStorage.removeItem('navigatingToSettings')
  }, [])

  const handleBackToNewEvent = () => {
    console.log('🔄 [SettingsPage] 新しい飲み会作成画面に戻ります')
    // フラグをクリア
    localStorage.removeItem('fromNewEventPage')
    router.push('/events/new')
  }

  const handleSave = () => {
    const configToSave = JSON.stringify(rules)
    console.log('Saving settings to localStorage:', configToSave)
    localStorage.setItem('settlementRules', configToSave)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setRules(DEFAULT_SETTLEMENT_RULES)
  }

  const updateGenderMultiplier = (gender: keyof SettlementRules['genderMultiplier'], value: number) => {
    setRules(prev => ({
      ...prev,
      genderMultiplier: {
        ...prev.genderMultiplier,
        [gender]: value
      }
    }))
  }

  const updateRoleMultiplier = (role: keyof SettlementRules['roleMultiplier'], value: number) => {
    setRules(prev => ({
      ...prev,
      roleMultiplier: {
        ...prev.roleMultiplier,
        [role]: value
      }
    }))
  }

  const updateStayRangeMultiplier = (range: keyof SettlementRules['stayRangeMultiplier'], value: number) => {
    setRules(prev => ({
      ...prev,
      stayRangeMultiplier: {
        ...prev.stayRangeMultiplier,
        [range]: value
      }
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">設定</h1>
        {fromNewEventPage && (
          <button
            onClick={handleBackToNewEvent}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>飲み会作成に戻る</span>
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* 性別による傾斜配分 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">性別による傾斜配分</h2>
          <p className="text-sm text-gray-600 mb-4">
            性別による支払い金額の調整係数を設定します。1.0が基準となります。
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                男性
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={rules.genderMultiplier.male}
                onChange={(e) => updateGenderMultiplier('male', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                女性
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={rules.genderMultiplier.female}
                onChange={(e) => updateGenderMultiplier('female', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                未設定
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={rules.genderMultiplier.unspecified}
                onChange={(e) => updateGenderMultiplier('unspecified', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 役割による傾斜配分 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">役割による傾斜配分</h2>
          <p className="text-sm text-gray-600 mb-4">
            役割による支払い金額の調整係数を設定します。1.0が基準となります。
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                先輩
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={rules.roleMultiplier.senior}
                onChange={(e) => updateRoleMultiplier('senior', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                後輩
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={rules.roleMultiplier.junior}
                onChange={(e) => updateRoleMultiplier('junior', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                フラット
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={rules.roleMultiplier.flat}
                onChange={(e) => updateRoleMultiplier('flat', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 滞在時間による傾斜配分 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">滞在時間による傾斜配分</h2>
          <p className="text-sm text-gray-600 mb-4">
            各次会の参加時間の割合による支払い金額の調整係数を設定します。0.0（参加なし）から1.0（全時間参加）の間で設定できます。
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1次会参加率
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={rules.stayRangeMultiplier.first}
                onChange={(e) => updateStayRangeMultiplier('first', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                例: 1.0=全時間参加, 0.7=70%参加, 0.0=参加なし
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2次会参加率
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={rules.stayRangeMultiplier.second}
                onChange={(e) => updateStayRangeMultiplier('second', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                例: 1.0=全時間参加, 0.7=70%参加, 0.0=参加なし
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3次会参加率
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={rules.stayRangeMultiplier.third}
                onChange={(e) => updateStayRangeMultiplier('third', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                例: 1.0=全時間参加, 0.7=70%参加, 0.0=参加なし
              </p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5 inline mr-2" />
            設定を保存
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            デフォルトに戻す
          </button>
        </div>

        {/* 傾斜配分のユースケース例 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">傾斜配分のユースケース例</h2>
          
          <div className="space-y-6">
            {/* 性別による傾斜配分の例 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">性別による傾斜配分</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">例1: 男性が多く支払う場合</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    男性: 1.2, 女性: 0.8, 未設定: 1.0
                  </p>
                  <p className="text-xs text-blue-700">
                    男性が20%多く、女性が20%少なく支払う設定です。
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">例2: 均等支払い</h4>
                  <p className="text-sm text-green-800 mb-2">
                    男性: 1.0, 女性: 1.0, 未設定: 1.0
                  </p>
                  <p className="text-xs text-green-700">
                    性別に関係なく均等に支払う設定です。
                  </p>
                </div>
              </div>
            </div>

            {/* 役割による傾斜配分の例 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">役割による傾斜配分</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">例1: 先輩が多く支払う場合</h4>
                  <p className="text-sm text-purple-800 mb-2">
                    先輩: 1.3, 後輩: 0.7, フラット: 1.0
                  </p>
                  <p className="text-xs text-purple-700">
                    先輩が30%多く、後輩が30%少なく支払う設定です。
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">例2: 均等支払い</h4>
                  <p className="text-sm text-orange-800 mb-2">
                    先輩: 1.0, 後輩: 1.0, フラット: 1.0
                  </p>
                  <p className="text-xs text-orange-700">
                    役割に関係なく均等に支払う設定です。
                  </p>
                </div>
              </div>
            </div>

            {/* 滞在時間による傾斜配分の例 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">滞在時間による傾斜配分</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">例1: 淳さん（全回参加）</h4>
                  <p className="text-sm text-red-800 mb-2">
                    1次会: 1.0, 2次会: 1.0, 3次会: 1.0
                  </p>
                  <p className="text-xs text-red-700">
                    1次会〜3次会まで全て参加するため、全ての回の支払いが必要です。
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-2">例2: 太郎さん（3次会は70%参加）</h4>
                  <p className="text-sm text-indigo-800 mb-2">
                    1次会: 1.0, 2次会: 1.0, 3次会: 0.7
                  </p>
                  <p className="text-xs text-indigo-700">
                    1次会と2次会は全時間参加、3次会は70%の時間参加するため、3次会の支払いは70%になります。
                  </p>
                </div>
              </div>
            </div>

            {/* 実際の計算例 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">実際の計算例</h3>
              <div className="text-sm text-gray-700 space-y-3">
                <p><strong>シナリオ:</strong> 1次会で¥10,000、3名が参加</p>
                
                <div className="bg-blue-50 p-3 rounded border">
                  <p className="font-medium mb-2">使用する設定値:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 性別: 男性1.2, 女性1.0, 未設定1.0</li>
                    <li>• 役割: 先輩1.3, 後輩0.8, フラット1.0</li>
                    <li>• 滞在時間: 1次会1.0, 2次会1.0, 3次会1.0（全員1次会のみ参加）</li>
                  </ul>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium mb-2">参加者と設定:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 田中さん（男性・先輩）: 男性1.2 × 先輩1.3 = 1.56倍</li>
                    <li>• 佐藤さん（女性・後輩）: 女性1.0 × 後輩0.8 = 0.8倍</li>
                    <li>• 鈴木さん（男性・フラット）: 男性1.2 × フラット1.0 = 1.2倍</li>
                  </ul>
                </div>

                <div className="bg-white p-3 rounded border">
                  <p className="font-medium mb-2">計算手順:</p>
                  <ol className="space-y-1 text-xs">
                    <li>1. 全員の傾斜係数を合計: 1.56 + 0.8 + 1.2 = 3.56</li>
                    <li>2. 基本金額を計算: ¥10,000 ÷ 3.56 = ¥2,809</li>
                    <li>3. 各自の支払額を計算:</li>
                    <ul className="ml-4 space-y-1">
                      <li>• 田中さん: ¥2,809 × 1.56 = ¥4,382</li>
                      <li>• 佐藤さん: ¥2,809 × 0.8 = ¥2,247</li>
                      <li>• 鈴木さん: ¥2,809 × 1.2 = ¥3,371</li>
                    </ul>
                    <li>4. 検算: ¥4,382 + ¥2,247 + ¥3,371 = ¥10,000 ✓</li>
                  </ol>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600">
                    📝 精算の考え方について
                  </summary>
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg text-xs text-gray-700 space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">精算の基本原則</h5>
                      <p>精算は「公平性」と「透明性」を重視します。参加者の属性（性別、役割、参加時間）に応じて支払額を調整し、全員の合計が総額と一致するように計算します。</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">傾斜配分の考え方</h5>
                      <ul className="space-y-1 ml-4">
                        <li>• <strong>性別</strong>: 社会的な慣習や飲酒量の違いを考慮</li>
                        <li>• <strong>役割</strong>: 先輩・後輩の関係性や立場を考慮</li>
                        <li>• <strong>参加時間</strong>: 実際に参加した時間の割合に応じて支払額を調整</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">計算の流れ</h5>
                      <ol className="space-y-1 ml-4">
                        <li>1. 各参加者の傾斜係数を計算（性別×役割×参加時間）</li>
                        <li>2. 全参加者の傾斜係数を合計</li>
                        <li>3. 総額を傾斜係数合計で割って基本金額を算出</li>
                        <li>4. 基本金額に各参加者の傾斜係数を掛けて支払額を決定</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">端数処理について</h5>
                      <p>実際の計算では端数を四捨五入して整数にします。これにより、支払いが現実的で分かりやすくなります。ただし、四捨五入による誤差が生じる場合があります。</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <h5 className="font-medium text-blue-900 mb-1">💡 ポイント</h5>
                      <p className="text-blue-800">この計算方式により、参加者の属性や参加状況に応じた公平な精算が可能になります。設定は自由にカスタマイズできるので、グループの慣習やルールに合わせて調整してください。</p>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* 保存完了メッセージ */}
        {saved && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            設定を保存しました
          </div>
        )}
      </div>
    </div>
  )
} 
