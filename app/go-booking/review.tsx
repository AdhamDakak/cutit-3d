import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { CreateBookingInput } from '@/lib/api'
import { getStylistServices, stylists, type StylistServiceType } from '@/lib/data'
import { useAddresses, useCreateBooking } from '@/lib/hooks'
import { calculateTravelFee } from '@/lib/travel-fee'
import { useThemeColors } from '@/lib/theme'
import { useGoBookingDraft } from './_layout'

export default function GoBookingReviewScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { stylistId, type } = useLocalSearchParams<{ stylistId: string; type: StylistServiceType }>()
  const { data: addresses } = useAddresses()
  const { mutate: createBooking, isPending: isConfirming, error: confirmError } = useCreateBooking()
  const { selectedServiceIds, addressId, eventDate, eventNotes, selectedTime } = useGoBookingDraft()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  const stylist = stylists.find((item) => item.id === stylistId)
  const address = (addresses ?? []).find((item) => item.id === addressId)
  const selectedServices = getStylistServices(stylistId).filter((service) => selectedServiceIds.has(service.id))
  const subtotal = selectedServices.reduce((sum, service) => sum + service.priceEGP, 0)
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.durationMinutes, 0)
  const travelFee = address ? calculateTravelFee(address.area) : 0
  const total = subtotal + travelFee
  const isEvents = type === 'events-bridal'

  const timeLabel = selectedTime ? new Date(selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
  const dateLabel = selectedTime ? new Date(selectedTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : ''

  const confirmBooking = async () => {
    if (!stylist || !address || !selectedTime) return
    const endTime = new Date(new Date(selectedTime).getTime() + totalDuration * 60_000).toISOString()
    const input: CreateBookingInput = {
      bookingType: isEvents ? 'events-bridal' : 'at-home',
      venueId: null,
      staffId: null,
      stylistId: stylist.id,
      addressId: address.id,
      travelFeeEGP: travelFee,
      eventDate: isEvents && eventDate.trim() ? eventDate.trim() : undefined,
      eventNotes: isEvents && eventNotes.trim() ? eventNotes.trim() : undefined,
      serviceIds: Array.from(selectedServiceIds),
      startTime: selectedTime,
      endTime,
      priceEGP: total,
    }
    try {
      const booking = await createBooking(input)
      router.replace(`/booking-confirmation?bookingId=${booking.id}`)
    } catch {
      // confirmError below already surfaces this in the UI
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
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('goBooking.reviewStepTitle')}</Text>
        <View className="size-9" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-28 pt-5">
        <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">
          {t('goBooking.stepIndicator', { current: 4, total: 4 })}
        </Text>

        <View className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="font-serif text-lg font-semibold text-stone-900 dark:text-white">{stylist?.name}</Text>
          <Text className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
            {dateLabel} · {timeLabel}
          </Text>
        </View>

        <View className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('venue.selectServices')}</Text>
          <View className="gap-2">
            {selectedServices.map((service) => (
              <View key={service.id} className="flex-row items-center justify-between">
                <Text className="text-sm text-stone-700 dark:text-zinc-200">{service.name}</Text>
                <Text className="text-sm font-medium text-stone-900 dark:text-white">{t('venue.priceEGP', { price: service.priceEGP })}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('goBooking.addressStepTitle')}</Text>
          <Text className="text-sm text-stone-700 dark:text-zinc-200">
            {address?.label} — {address?.area}, {address?.details}
          </Text>
          {isEvents && eventDate.trim() ? (
            <Text className="mt-2 text-sm text-stone-500 dark:text-zinc-400">{t('goBooking.eventDateLabel')}: {eventDate}</Text>
          ) : null}
          {isEvents && eventNotes.trim() ? (
            <Text className="mt-1 text-sm text-stone-500 dark:text-zinc-400">{eventNotes}</Text>
          ) : null}
        </View>

        <View className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-stone-600 dark:text-zinc-300">{t('goBooking.subtotal')}</Text>
            <Text className="text-sm font-medium text-stone-900 dark:text-white">{t('venue.priceEGP', { price: subtotal })}</Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm text-stone-600 dark:text-zinc-300">{t('goBooking.travelFee')}</Text>
            <Text className="text-sm font-medium text-stone-900 dark:text-white">{t('venue.priceEGP', { price: travelFee })}</Text>
          </View>
          <View className="mt-3 flex-row items-center justify-between border-t border-stone-100 pt-3 dark:border-zinc-800">
            <Text className="font-semibold text-stone-900 dark:text-white">{t('venue.total')}</Text>
            <Text className="text-lg font-bold text-stone-900 dark:text-white">{t('venue.priceEGP', { price: total })}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        {confirmError ? <Text className="mb-2 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
        <Pressable disabled={isConfirming} onPress={confirmBooking} className="items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-50">
          <Text className="font-semibold text-white">{t(isConfirming ? 'venue.confirmingBooking' : 'venue.confirmBooking')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
