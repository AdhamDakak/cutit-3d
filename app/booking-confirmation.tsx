import { useEffect } from 'react'
import { BackHandler, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CalendarCheck, CheckCircle2, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { services, staff, stylists, venues } from '@/lib/data'
import { useAddresses, useBooking } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

export default function BookingConfirmationScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const { data: booking, isLoading } = useBooking(bookingId)
  const { data: addresses } = useAddresses()

  // This is a terminal screen after a completed booking — swipe-to-dismiss
  // is disabled at the route level (app/_layout.tsx), and Android's
  // hardware back must be blocked here too so the only way out is via
  // "View in Bookings" or "Done".
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => subscription.remove()
  }, [])

  const goHome = () => {
    router.dismissAll()
    router.replace('/(tabs)')
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-end border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Pressable
            onPress={goHome}
            accessibilityLabel={t('common.done')}
            className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <X size={18} color={colors.foreground} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-stone-600 dark:text-zinc-300">{isLoading ? t('common.loading') : t('bookingConfirmation.notFound')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const isSalon = booking.bookingType === 'salon'
  const venue = isSalon ? venues.find((item) => item.id === booking.venueId) : undefined
  const staffMember = isSalon ? staff.find((item) => item.id === booking.staffId) : undefined
  const stylist = !isSalon ? stylists.find((item) => item.id === booking.stylistId) : undefined
  const address = !isSalon ? (addresses ?? []).find((item) => item.id === booking.addressId) : undefined
  const bookedServices = services.filter((service) => booking.serviceIds.includes(service.id))

  const dateLabel = new Date(booking.startTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  const timeLabel = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const goToBookings = () => {
    router.dismissAll()
    router.replace('/(tabs)/bookings')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-end border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          onPress={goHome}
          accessibilityLabel={t('common.done')}
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <X size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="items-center gap-4 px-6 pb-28 pt-12">
        <View className="size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 size={36} color="#059669" />
        </View>
        <Text className="text-center font-serif text-2xl font-semibold text-stone-900 dark:text-white">{t('bookingConfirmation.title')}</Text>
        <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('bookingConfirmation.subtitle')}</Text>

        <View className="mt-4 w-full gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="font-serif text-lg font-semibold text-stone-900 dark:text-white">{isSalon ? venue?.name : stylist?.name}</Text>
          {isSalon ? (
            booking.anyStaff ? (
              <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('venue.anyStylist')}</Text>
            ) : staffMember ? (
              <Text className="text-sm text-stone-500 dark:text-zinc-400">
                {staffMember.name} <Text className="text-stone-400 dark:text-zinc-500">({staffMember.role})</Text>
              </Text>
            ) : null
          ) : null}
          {!isSalon && address ? (
            <Text className="text-sm text-stone-500 dark:text-zinc-400">
              {address.label} · {address.area}, {address.details}
            </Text>
          ) : null}

          <View className="gap-2 border-t border-stone-100 pt-3 dark:border-zinc-800">
            {bookedServices.map((service) => (
              <View key={service.id} className="flex-row items-center justify-between">
                <Text className="text-sm text-stone-700 dark:text-zinc-200">{service.name}</Text>
                <Text className="text-sm font-medium text-stone-900 dark:text-white">{t('venue.priceEGP', { price: service.priceEGP })}</Text>
              </View>
            ))}
          </View>

          {!isSalon && booking.travelFeeEGP ? (
            <View className="flex-row items-center justify-between border-t border-stone-100 pt-3 dark:border-zinc-800">
              <Text className="text-sm text-stone-600 dark:text-zinc-300">{t('goBooking.travelFee')}</Text>
              <Text className="text-sm font-medium text-stone-900 dark:text-white">{t('venue.priceEGP', { price: booking.travelFeeEGP })}</Text>
            </View>
          ) : null}

          <View className="flex-row items-center justify-between border-t border-stone-100 pt-3 dark:border-zinc-800">
            <Text className="text-sm text-stone-600 dark:text-zinc-300">
              {dateLabel} · {timeLabel}
            </Text>
            <Text className="text-lg font-bold text-stone-900 dark:text-white">{t('venue.priceEGP', { price: booking.priceEGP })}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="gap-3 border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          onPress={() => {}}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-stone-300 py-3.5 dark:border-zinc-700"
        >
          <CalendarCheck size={18} color={colors.foreground} />
          <Text className="font-semibold text-stone-900 dark:text-white">{t('bookingConfirmation.addToCalendar')}</Text>
        </Pressable>
        <Pressable onPress={goToBookings} className="items-center rounded-xl bg-blue-600 py-3.5">
          <Text className="font-semibold text-white">{t('bookingConfirmation.viewInBookings')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
