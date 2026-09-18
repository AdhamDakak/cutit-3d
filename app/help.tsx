import { Alert, I18nManager, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { SettingRow } from '@/components/settings-rows'
import { getBookingDetails } from '@/lib/api'
import type { BookingStatus } from '@/lib/data'
import { useAddresses, useBooking, useCancelBooking } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

const STATUS_PILL_CLASSES: Record<BookingStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
  cancelled: { bg: 'bg-stone-200 dark:bg-zinc-700', text: 'text-stone-600 dark:text-zinc-300' },
}

export default function HelpScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>()
  const { data: booking } = useBooking(bookingId)
  const { data: addresses } = useAddresses()
  const { mutate: cancelBooking } = useCancelBooking()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  const details = booking ? getBookingDetails(booking, addresses ?? []) : null

  const canActOnBooking = !!booking && booking.status !== 'completed' && booking.status !== 'cancelled'

  const isSalon = booking?.bookingType === 'salon'
  const isAnyStaff = !!booking?.anyStaff
  const title = details ? (isSalon ? details.venue?.name : details.stylist?.name) : null
  const dateTimeLabel = details ? `${details.dateLabel} · ${details.timeLabel}` : null

  const handleCancel = () => {
    if (!booking) return
    Alert.alert(t('help.cancelConfirmTitle'), t('help.cancelConfirmMessage'), [
      { text: t('help.keepBooking'), style: 'cancel' },
      {
        text: t('help.confirmCancelBooking'),
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBooking(booking.id)
            router.back()
          } catch {
            Alert.alert(t('common.somethingWentWrong'))
          }
        },
      },
    ])
  }

  const handleReschedule = () => {
    if (!booking) return
    router.push({ pathname: '/reschedule', params: { bookingId: booking.id } })
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.close')}
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <BackIcon size={18} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('help.title')}</Text>
        <View className="size-9" />
      </View>

      <View className="gap-3 px-5 py-6">
        {booking && details ? (
          <View className="mb-1 gap-2 rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <View className="flex-row items-start justify-between gap-2">
              <Text numberOfLines={1} className="flex-1 font-serif text-base font-semibold text-stone-900 dark:text-white">
                {title}
              </Text>
              <View className={`rounded-full px-2 py-1 ${STATUS_PILL_CLASSES[booking.status].bg}`}>
                <Text className={`text-[10px] font-semibold ${STATUS_PILL_CLASSES[booking.status].text}`}>{t(`bookings.${booking.status}`)}</Text>
              </View>
            </View>
            {isSalon ? (
              <Text className="text-xs text-stone-500 dark:text-zinc-400">
                {isAnyStaff ? t('venue.anyStylist') : details.staff ? `${details.staff.name} (${details.staff.role})` : null}
              </Text>
            ) : null}
            <Text className="text-xs text-stone-500 dark:text-zinc-400">{dateTimeLabel}</Text>
          </View>
        ) : null}

        {canActOnBooking ? (
          <>
            <Pressable onPress={handleReschedule} className="items-center rounded-xl bg-stone-900 py-2.5 dark:bg-blue-600">
              <Text className="text-xs font-semibold text-white">{t('help.rescheduleBooking')}</Text>
            </Pressable>

            <Pressable onPress={handleCancel} className="items-center rounded-xl border border-stone-200 py-2.5 dark:border-zinc-700">
              <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{t('help.cancelBooking')}</Text>
            </Pressable>
          </>
        ) : null}

        <View className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <SettingRow
            icon={MessageCircle}
            label={t('help.chatSupport')}
            value={t('help.chatWithTeam')}
            onPress={() => router.push('/chat-support')}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}
