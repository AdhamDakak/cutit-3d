import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { ErrorState } from '@/components/error-state'
import type { StylistServiceType } from '@/lib/data'
import { useStylist, useStylistServices } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'
import { useGoBookingDraft } from './_layout'

export default function GoBookingServicesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { stylistId, type } = useLocalSearchParams<{ stylistId: string; type: StylistServiceType }>()
  const { selectedServiceIds, toggleService } = useGoBookingDraft()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  const { data: stylist } = useStylist(stylistId)
  const { data: stylistServicesData, isLoading, error, refetch } = useStylistServices(stylistId)
  const stylistServices = stylistServicesData ?? []
  const subtotal = stylistServices
    .filter((service) => selectedServiceIds.has(service.id))
    .reduce((sum, service) => sum + service.priceEGP, 0)
  const canContinue = selectedServiceIds.size > 0

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <BackIcon size={18} color={colors.foreground} />
        </Pressable>
        <Text numberOfLines={1} className="mx-3 flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">
          {stylist?.name}
        </Text>
        <View className="size-9" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
        </View>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-28 pt-5">
          <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">
            {t('goBooking.stepIndicator', { current: 1, total: 4 })}
          </Text>
          <Text className="font-serif text-xl font-semibold text-stone-900 dark:text-white">{t('venue.selectServices')}</Text>

          <View className="gap-3">
            {stylistServices.map((service) => {
              const selected = selectedServiceIds.has(service.id)
              return (
                <Pressable
                  key={service.id}
                  onPress={() => toggleService(service.id)}
                  className={`flex-row items-start gap-3 rounded-lg border p-3 ${
                    selected ? 'border-stone-900 bg-stone-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                  }`}
                >
                  <View
                    className={`mt-1 size-4 items-center justify-center rounded border ${
                      selected ? 'border-blue-600 bg-blue-600' : 'border-stone-300 bg-white dark:border-zinc-600'
                    }`}
                  >
                    {selected && <View className="size-2 rounded-sm bg-white" />}
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-stone-900 dark:text-white">{service.name}</Text>
                    <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('venue.minutesShort', { count: service.durationMinutes })}</Text>
                  </View>
                  <Text className="shrink-0 font-semibold text-stone-900 dark:text-white">{t('venue.priceEGP', { price: service.priceEGP })}</Text>
                </Pressable>
              )
            })}
          </View>
        </ScrollView>
      )}

      <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs uppercase tracking-widest text-stone-500 dark:text-zinc-400">{t('goBooking.subtotal')}</Text>
            <Text className="text-2xl font-bold text-stone-900 dark:text-white">{t('venue.priceEGP', { price: subtotal })}</Text>
          </View>
          <Pressable
            disabled={!canContinue}
            onPress={() => router.push({ pathname: '/go-booking/address', params: { stylistId, type } })}
            className="rounded-xl bg-blue-600 px-6 py-3 disabled:opacity-50"
          >
            <Text className="font-semibold text-white">{t('common.continue')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
