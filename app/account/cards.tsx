import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CreditCard, Plus, Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { AddCardInfoSheet } from '@/components/add-card-info-sheet'
import { CardBrandBadge, maskedCard } from '@/components/card-brand-badge'
import { ErrorState } from '@/components/error-state'
import { StackHeader } from '@/components/stack-header'
import type { SavedCard } from '@/lib/data'
import { useCards, useRemoveCard, useSetDefaultCard } from '@/lib/hooks'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

export default function CardsScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const { data: cards, isLoading, error, refetch } = useCards()
  const { mutate: removeCard } = useRemoveCard()
  const { mutate: setDefaultCard, isPending: isSettingDefault } = useSetDefaultCard()
  const [showAddInfo, setShowAddInfo] = useState(false)

  const confirmRemove = (card: SavedCard) => {
    Alert.alert(t('payments.removeCardTitle'), t('payments.removeCardBody', { card: maskedCard(card) }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('payments.remove'),
        style: 'destructive',
        onPress: () => {
          removeCard(card.id).catch(() => Alert.alert(t('common.somethingWentWrong')))
        },
      },
    ])
  }

  const list = cards ?? []

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t('profile.savedCards')} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-10 pt-5">
        {!cards && isLoading ? (
          <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
        ) : !cards && error ? (
          <ErrorState onRetry={refetch} />
        ) : list.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 dark:border-zinc-700 dark:bg-zinc-900/40">
            <View className="size-14 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
              <CreditCard size={24} color={colors.muted} />
            </View>
            <Text className="mt-4 text-center text-sm text-stone-500 dark:text-zinc-400">{t('payments.noCards')}</Text>
          </View>
        ) : (
          <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {list.map((card) => (
              <View key={card.id} className="gap-3 border-b border-stone-100 px-4 py-4 dark:border-zinc-800">
                <View className="flex-row items-center gap-3">
                  <CardBrandBadge brand={card.brand} />
                  <View className="min-w-0 flex-1">
                    {/* Card digits read LTR in every locale, like phone numbers. */}
                    <Text style={[startAlign, { writingDirection: 'ltr' }]} className="text-sm font-semibold text-stone-900 dark:text-white">
                      {maskedCard(card)}
                    </Text>
                    <Text style={startAlign} className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
                      {t('payments.expires', { date: `${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}` })}
                    </Text>
                  </View>
                  {card.isDefault ? (
                    <View className="rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-900/30">
                      <Text className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">{t('payments.default')}</Text>
                    </View>
                  ) : null}
                </View>
                <View className="flex-row items-center gap-2">
                  {!card.isDefault ? (
                    <Pressable
                      disabled={isSettingDefault}
                      onPress={() => setDefaultCard(card.id).catch(() => Alert.alert(t('common.somethingWentWrong')))}
                      className="rounded-lg border border-stone-200 px-3 py-1.5 disabled:opacity-50 dark:border-zinc-700"
                    >
                      <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{t('payments.setDefault')}</Text>
                    </Pressable>
                  ) : null}
                  <Pressable onPress={() => confirmRemove(card)} className="flex-row items-center gap-1 rounded-lg px-2 py-1.5">
                    <Trash2 size={14} color="#ef4444" />
                    <Text className="text-xs font-semibold text-red-500">{t('payments.remove')}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => setShowAddInfo(true)}
          className="flex-row items-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 py-3 dark:border-zinc-700"
        >
          <Plus size={16} color={colors.accent} />
          <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t('payments.addCard')}</Text>
        </Pressable>
      </ScrollView>
      <AddCardInfoSheet visible={showAddInfo} onClose={() => setShowAddInfo(false)} />
    </SafeAreaView>
  )
}
