import { useMemo } from 'react'
import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { getStylistServices, generateStylistTimeSlots, type StylistServiceType } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'
import { useGoBookingDraft } from './_layout'

export default function GoBookingDatetimeScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { stylistId, type } = useLocalSearchParams<{ stylistId: string; type: StylistServiceType }>()
  const { selectedServiceIds, selectedDate, setSelectedDate, selectedTime, setSelectedTime } = useGoBookingDraft()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  const dayFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, { weekday: 'short', day: 'numeric' }), [i18n.language])

  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      return date
    })
  }, [])

  const activeDate = selectedDate ?? dates[0]

  const totalDuration = getStylistServices(stylistId)
    .filter((service) => selectedServiceIds.has(service.id))
    .reduce((sum, service) => sum + service.durationMinutes, 0)

  const daySlots = totalDuration > 0 ? generateStylistTimeSlots({ stylistId, durationMinutes: totalDuration, date: activeDate }) : []

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
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('venue.selectTime')}</Text>
        <View className="size-9" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-28 pt-5">
        <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">
          {t('goBooking.stepIndicator', { current: 3, total: 4 })}
        </Text>

        <View>
          <Text className="mb-3 font-semibold text-stone-900 dark:text-white">{t('venue.selectDate')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {dates.map((date, idx) => {
                const active = date.toDateString() === activeDate.toDateString()
                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      setSelectedDate(date)
                      setSelectedTime(null)
                    }}
                    className={`rounded-full border px-3.5 py-2 ${
                      active
                        ? 'border-stone-900 bg-stone-900 dark:border-blue-500 dark:bg-blue-600'
                        : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                    }`}
                  >
                    <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-stone-600 dark:text-zinc-300'}`}>{dayFormatter.format(date)}</Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>
        </View>

        <View className="gap-2">
          <Text className="font-semibold text-stone-900 dark:text-white">{t('venue.selectTime')}</Text>
          {daySlots.length === 0 && <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('venue.noAvailability')}</Text>}
          <View className="flex-row flex-wrap gap-2">
            {daySlots.map((slot) => {
              const active = selectedTime === slot.startTime
              const disabled = slot.status !== 'available'
              const timeLabel = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              return (
                <Pressable
                  key={slot.id}
                  disabled={disabled}
                  onPress={() => setSelectedTime(slot.startTime)}
                  className={`min-w-[70px] items-center rounded-lg border py-2 ${
                    active
                      ? 'border-transparent bg-stone-900 dark:bg-blue-600'
                      : disabled
                        ? 'border-stone-100 bg-stone-50 opacity-40 dark:border-zinc-800 dark:bg-zinc-900'
                        : 'border-stone-200 bg-white dark:border-transparent dark:bg-zinc-800'
                  }`}
                >
                  <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-stone-900 dark:text-zinc-100'}`}>{timeLabel}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          disabled={!selectedTime}
          onPress={() => router.push({ pathname: '/go-booking/review', params: { stylistId, type } })}
          className="items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-50"
        >
          <Text className="font-semibold text-white">{t('common.continue')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
