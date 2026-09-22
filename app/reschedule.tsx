import { useMemo, useState } from 'react'
import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { ANY_STAFF_ID, getBookingDetails, type ListSlotsParams } from '@/lib/api'
import { useAddresses, useBooking, useRescheduleBooking, useSlots } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

const SLOT_SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6']

export default function RescheduleScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const { data: booking, isLoading: bookingLoading } = useBooking(bookingId)
  const { data: addresses } = useAddresses()
  const { mutate: rescheduleBooking, isPending: isRescheduling, error: rescheduleError } = useRescheduleBooking()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const dayFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, { weekday: 'short', day: 'numeric' }), [i18n.language])
  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      return date
    })
  }, [])

  const details = booking ? getBookingDetails(booking, addresses ?? []) : null
  const isSalon = booking?.bookingType === 'salon'
  const totalDuration = details ? details.services.reduce((sum, service) => sum + service.durationMinutes, 0) || 30 : 30
  const activeDate = selectedDate ?? dates[0]

  const slotsParams: ListSlotsParams | null = !booking
    ? null
    : isSalon && booking.venueId
      ? {
          venueId: booking.venueId,
          staffId: booking.staffId ?? ANY_STAFF_ID,
          serviceId: details?.services[0]?.id ?? '',
          date: activeDate,
          durationMinutes: totalDuration,
        }
      : booking.stylistId
        ? {
            stylistId: booking.stylistId,
            date: activeDate,
            durationMinutes: totalDuration,
            // Exclude the booking being rescheduled itself, otherwise its own
            // current slot would show as "booked" against its own old time.
            excludeBookingId: booking.id,
          }
        : null

  const { data: daySlots = [], isLoading: slotsLoading, error: slotsError, refetch: refetchSlots } = useSlots(slotsParams)

  if (!booking || !details) {
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
          <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('reschedule.title')}</Text>
          <View className="size-9" />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-stone-600 dark:text-zinc-300">
            {bookingLoading ? t('common.loading') : t('bookingConfirmation.notFound')}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const confirmReschedule = async () => {
    if (!selectedTime) return
    const endTime = new Date(new Date(selectedTime).getTime() + totalDuration * 60_000).toISOString()
    try {
      await rescheduleBooking(booking.id, selectedTime, endTime)
      router.dismissTo('/(tabs)/bookings')
    } catch {
      // rescheduleError below already surfaces this in the UI
    }
  }

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
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('reschedule.title')}</Text>
        <View className="size-9" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-28 pt-5">
        <View className="rounded-xl border border-stone-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-zinc-500">{t('reschedule.currentAppointment')}</Text>
          <Text className="mt-1 text-sm font-medium text-stone-900 dark:text-white">
            {details.dateLabel} · {details.timeLabel}
          </Text>
        </View>

        <View>
          <Text className="mb-3 font-semibold text-stone-900 dark:text-white">{t('reschedule.selectNewTime')}</Text>
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
          {slotsLoading ? (
            <View className="flex-row flex-wrap gap-2">
              {SLOT_SKELETON_KEYS.map((key) => (
                <View key={key} className="h-9 w-[70px] rounded-lg bg-stone-100 dark:bg-zinc-800" />
              ))}
            </View>
          ) : slotsError ? (
            <View className="items-center gap-2 py-2">
              <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('common.somethingWentWrong')}</Text>
              <Pressable onPress={refetchSlots} className="rounded-lg bg-stone-900 px-4 py-2 dark:bg-blue-600">
                <Text className="text-xs font-semibold text-white">{t('common.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <>
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
            </>
          )}
        </View>
      </ScrollView>

      <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        {rescheduleError ? <Text className="mb-2 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
        <Pressable
          disabled={!selectedTime || isRescheduling}
          onPress={confirmReschedule}
          className="items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-50"
        >
          <Text className="font-semibold text-white">{t(isRescheduling ? 'venue.confirmingBooking' : 'reschedule.confirmNewTime')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
