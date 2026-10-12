import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Banknote, CreditCard, WalletCards } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { maskedCard } from '@/components/card-brand-badge'
import { StackHeader } from '@/components/stack-header'
import type { PaymentMethodType } from '@/lib/data'
import { useCards, useDefaultPaymentMethod, useSetDefaultPaymentMethod, useWallet } from '@/lib/hooks'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

export default function PaymentMethodScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const { data: method } = useDefaultPaymentMethod()
  const { data: cards } = useCards()
  const { data: wallet } = useWallet()
  const { mutate: setMethod, isPending } = useSetDefaultPaymentMethod()

  const defaultCard = cards?.find((card) => card.isDefault)
  const balance = wallet?.balanceEGP ?? 0

  const options: { type: PaymentMethodType; icon: typeof CreditCard; detail: string; disabledHint: string | null; ltr?: boolean }[] = [
    {
      type: 'card',
      icon: CreditCard,
      detail: defaultCard ? maskedCard(defaultCard) : t('payments.none'),
      disabledHint: cards && cards.length === 0 ? t('payments.cardDisabledHint') : null,
      ltr: !!defaultCard,
    },
    { type: 'cash', icon: Banknote, detail: t('payments.cashDetail'), disabledHint: null },
    {
      type: 'wallet',
      icon: WalletCards,
      detail: t('payments.walletDetail', { balance: t('venue.priceEGP', { price: balance }) }),
      disabledHint: wallet && balance <= 0 ? t('payments.walletDisabledHint') : null,
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t('profile.defaultPayment')} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-10 pt-5">
        <View accessibilityRole="radiogroup" className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {options.map(({ type, icon: Icon, detail, disabledHint, ltr }) => {
            const selected = method === type
            const disabled = !!disabledHint || isPending
            return (
              <Pressable
                key={type}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled: !!disabledHint }}
                disabled={disabled}
                onPress={() => setMethod(type).catch(() => Alert.alert(t('common.somethingWentWrong')))}
                className={`min-h-16 flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800 ${disabledHint ? 'opacity-50' : ''}`}
              >
                <View className="size-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800">
                  <Icon size={16} color={colors.mutedStrong} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text style={startAlign} className="text-sm font-medium text-stone-900 dark:text-white">
                    {t(`payments.method.${type}`)}
                  </Text>
                  <Text style={[startAlign, ltr ? { writingDirection: 'ltr' } : null]} numberOfLines={1} className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
                    {disabledHint ?? detail}
                  </Text>
                </View>
                <View className={`size-5 items-center justify-center rounded-full border-2 ${selected ? 'border-blue-600' : 'border-stone-300 dark:border-zinc-600'}`}>
                  {selected ? <View className="size-2.5 rounded-full bg-blue-600" /> : null}
                </View>
              </Pressable>
            )
          })}
        </View>
        <Text style={startAlign} className="px-1 text-xs leading-5 text-stone-400 dark:text-zinc-500">
          {t('payments.methodFootnote')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
