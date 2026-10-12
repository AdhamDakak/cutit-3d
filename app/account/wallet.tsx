import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowDownLeft, ArrowUpRight, Plus, RotateCcw, WalletCards } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { ErrorState } from '@/components/error-state'
import { StackHeader } from '@/components/stack-header'
import { MAX_TOP_UP_EGP } from '@/lib/api'
import type { WalletTransaction } from '@/lib/data'
import { useTopUpWallet, useWallet } from '@/lib/hooks'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

const PRESET_AMOUNTS = [100, 200, 500] as const
type AmountChoice = (typeof PRESET_AMOUNTS)[number] | 'custom'

const TRANSACTION_ICON = { topup: ArrowDownLeft, refund: RotateCcw, payment: ArrowUpRight } as const

export default function WalletScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const { data: wallet, isLoading, error, refetch } = useWallet()
  const { mutate: topUp, isPending, error: topUpError } = useTopUpWallet()

  const [showTopUp, setShowTopUp] = useState(false)
  const [choice, setChoice] = useState<AmountChoice>(200)
  const [custom, setCustom] = useState('')
  const [lastTopUp, setLastTopUp] = useState<number | null>(null)

  const customAmount = Number(custom)
  const amount = choice === 'custom' ? customAmount : choice
  const amountValid = Number.isInteger(amount) && amount > 0 && amount <= MAX_TOP_UP_EGP

  const confirmTopUp = async () => {
    if (!amountValid || isPending) return
    try {
      await topUp(amount)
      setLastTopUp(amount)
      setShowTopUp(false)
      setCustom('')
    } catch {
      // error below surfaces this; the panel stays open
    }
  }

  const signed = (tx: WalletTransaction) => `${tx.type === 'payment' ? '−' : '+'}${t('venue.priceEGP', { price: tx.amountEGP })}`

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t('profile.wallet')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pb-10 pt-5" keyboardShouldPersistTaps="handled">
          {!wallet && isLoading ? (
            <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
          ) : !wallet && error ? (
            <ErrorState onRetry={refetch} />
          ) : wallet ? (
            <>
              <View className="rounded-2xl bg-blue-600 p-5">
                <View className="flex-row items-center gap-2">
                  <WalletCards size={16} color="#dbeafe" />
                  <Text className="text-xs font-medium text-blue-100">{t('profile.availableBalance')}</Text>
                </View>
                <Text style={startAlign} className="mt-2 text-3xl font-bold text-white">
                  {t('venue.priceEGP', { price: wallet.balanceEGP })}
                </Text>
                {lastTopUp ? <Text className="mt-1 text-xs text-blue-100">{t('payments.topUpDone', { amount: t('venue.priceEGP', { price: lastTopUp }) })}</Text> : null}
                {!showTopUp ? (
                  <Pressable onPress={() => setShowTopUp(true)} className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-white py-3">
                    <Plus size={16} color="#2563eb" />
                    <Text className="text-sm font-semibold text-blue-600">{t('payments.topUp')}</Text>
                  </Pressable>
                ) : null}
              </View>

              {showTopUp ? (
                <View className="gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <Text style={startAlign} className="text-sm font-semibold text-stone-900 dark:text-white">
                    {t('payments.chooseAmount')}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {[...PRESET_AMOUNTS, 'custom' as const].map((item) => {
                      const active = choice === item
                      return (
                        <Pressable
                          key={item}
                          onPress={() => setChoice(item)}
                          className={`rounded-full border px-3.5 py-2 ${
                            active ? 'border-stone-900 bg-stone-900 dark:border-blue-500 dark:bg-blue-600' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                          }`}
                        >
                          <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-stone-600 dark:text-zinc-400'}`}>
                            {item === 'custom' ? t('payments.customAmount') : t('venue.priceEGP', { price: item })}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                  {choice === 'custom' ? (
                    <TextInput
                      value={custom}
                      onChangeText={(text) => setCustom(text.replace(/[^0-9]/g, ''))}
                      placeholder={t('payments.customAmountPlaceholder', { max: MAX_TOP_UP_EGP })}
                      placeholderTextColor={colors.muted}
                      keyboardType="number-pad"
                      autoFocus
                      textAlignVertical="center"
                      style={{ fontSize: 14, lineHeight: 18 }}
                      className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                  ) : null}
                  {choice === 'custom' && custom !== '' && !amountValid ? (
                    <Text style={startAlign} className="text-xs text-red-500">
                      {t('payments.amountInvalid', { max: MAX_TOP_UP_EGP })}
                    </Text>
                  ) : null}
                  {topUpError ? <Text className="text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
                  <Text style={startAlign} className="text-xs text-stone-400 dark:text-zinc-500">
                    {t('payments.mockNotice')}
                  </Text>
                  <View className="flex-row gap-2">
                    <Pressable onPress={() => setShowTopUp(false)} className="flex-1 items-center rounded-xl border border-stone-200 py-3 dark:border-zinc-700">
                      <Text className="text-sm font-semibold text-stone-700 dark:text-zinc-200">{t('common.cancel')}</Text>
                    </Pressable>
                    <Pressable
                      disabled={!amountValid || isPending}
                      onPress={() => void confirmTopUp()}
                      className="flex-1 items-center rounded-xl bg-blue-600 py-3 disabled:opacity-50"
                    >
                      <Text className="text-sm font-semibold text-white">
                        {isPending ? t('account.saving') : amountValid ? t('payments.topUpAmount', { amount: t('venue.priceEGP', { price: amount }) }) : t('payments.topUp')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              <View>
                <Text style={startAlign} className="mb-2 px-1 font-semibold text-stone-900 dark:text-white">
                  {t('payments.history')}
                </Text>
                {wallet.transactions.length === 0 ? (
                  <View className="items-center rounded-2xl border border-dashed border-stone-300 px-6 py-10 dark:border-zinc-700">
                    <WalletCards size={22} color={colors.muted} />
                    <Text className="mt-3 text-center text-sm text-stone-500 dark:text-zinc-400">{t('payments.noTransactions')}</Text>
                  </View>
                ) : (
                  <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    {wallet.transactions.map((tx) => {
                      const Icon = TRANSACTION_ICON[tx.type]
                      return (
                        <View key={tx.id} className="flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
                          <View className="size-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800">
                            <Icon size={16} color={colors.mutedStrong} />
                          </View>
                          <View className="min-w-0 flex-1">
                            <Text style={startAlign} className="text-sm font-medium text-stone-900 dark:text-white">
                              {t(`payments.transaction.${tx.type}`)}
                            </Text>
                            <Text style={startAlign} className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
                              {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                          </View>
                          <Text className={`text-sm font-semibold ${tx.type === 'payment' ? 'text-stone-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {signed(tx)}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
