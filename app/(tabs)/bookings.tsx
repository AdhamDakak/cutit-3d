import { useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Bell, CalendarDays, CalendarX2, Clock3 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { BookingCard } from '@/components/booking-card'
import { ReviewModal, type ReviewTarget } from '@/components/review-modal'
import { getBookingDetails } from '@/lib/api'
import type { Booking } from '@/lib/data'
import { useAddresses, useBookings, useReviewedBookingIds } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

type Tab = 'Upcoming' | 'Past History'

const UPCOMING_STATUSES: Booking['status'][] = ['pending', 'confirmed']
const PAST_STATUSES: Booking['status'][] = ['completed', 'cancelled']

export default function BookingsScreen() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('Upcoming')
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null)
  const colors = useThemeColors()
  const router = useRouter()
  const { data: bookings, isLoading: bookingsLoading } = useBookings()
  const { data: addresses } = useAddresses()
  const { data: reviewedBookingIds } = useReviewedBookingIds()

  const myBookings = bookings ?? []

  const upcoming = myBookings
    .filter((booking) => UPCOMING_STATUSES.includes(booking.status))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const past = myBookings
    .filter((booking) => PAST_STATUSES.includes(booking.status))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const soonest = upcoming[0]
  const soonestDetails = soonest ? getBookingDetails(soonest, addresses ?? []) : null
  const minutesUntil = soonestDetails ? Math.max(0, Math.round((soonestDetails.startDate.getTime() - Date.now()) / 60000)) : 0
  const hoursUntil = Math.floor(minutesUntil / 60)
  const remainderMinutes = minutesUntil % 60
  const isSoonestToday = soonestDetails ? soonestDetails.startDate.toDateString() === new Date().toDateString() : false

  const reviewBooking = past.find((booking) => booking.id === reviewBookingId)
  const reviewDetails = reviewBooking ? getBookingDetails(reviewBooking, addresses ?? []) : null
  const reviewTarget: ReviewTarget | null =
    reviewBooking && reviewBooking.bookingType === 'salon' && reviewBooking.venueId
      ? { kind: 'venue', id: reviewBooking.venueId, bookingId: reviewBooking.id }
      : reviewBooking?.stylistId
        ? { kind: 'stylist', id: reviewBooking.stylistId, bookingId: reviewBooking.id }
        : null

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top']}>
      <View className="border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">{t('bookings.yourVisits')}</Text>
            <Text className="mt-1 font-serif text-2xl font-semibold text-stone-900 dark:text-white">{t('bookings.title')}</Text>
          </View>
          <Pressable accessibilityLabel={t('bookings.notifications')} className="relative size-10 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <Bell size={16} color={colors.foreground} />
            <View className="absolute end-2 top-2 size-1.5 rounded-full bg-blue-600" />
          </Pressable>
        </View>
        <View className="mt-5 flex-row rounded-xl bg-stone-200/70 p-1 dark:bg-zinc-900">
          {(['Upcoming', 'Past History'] as Tab[]).map((item) => (
            <Pressable key={item} onPress={() => setTab(item)} className={`flex-1 items-center rounded-lg py-2.5 ${tab === item ? 'bg-white dark:bg-zinc-800' : ''}`}>
              <Text className={`text-sm font-semibold ${tab === item ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-zinc-400'}`}>
                {item === 'Upcoming' ? t('bookings.tabUpcoming') : t('bookings.tabPastHistory')}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {bookingsLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
        </View>
      ) : tab === 'Upcoming' ? (
        <FlatList
          data={upcoming}
          keyExtractor={(booking) => booking.id}
          contentContainerClassName="gap-4 px-5 pb-10 pt-5"
          ListHeaderComponent={
            soonestDetails ? (
              <View className="mb-4 flex-row items-center gap-3 rounded-2xl bg-blue-50 px-4 py-4 dark:bg-blue-950/50">
                <View className="size-10 items-center justify-center rounded-xl bg-blue-600">
                  <Clock3 size={20} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {t('bookings.appointmentIn', { count: hoursUntil, minutes: remainderMinutes })}
                  </Text>
                  <Text className="mt-1 text-xs text-blue-900/70 dark:text-blue-100/70">
                    {isSoonestToday
                      ? t('bookings.todayAt', { time: soonestDetails.timeLabel })
                      : t('bookings.upcomingAt', { date: soonestDetails.dateLabel, time: soonestDetails.timeLabel })}
                  </Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => <BookingCard booking={item} variant="upcoming" />}
          ListEmptyComponent={
            <View className="items-center gap-4 px-4 py-16">
              <View className="size-16 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
                <CalendarDays size={28} color={colors.muted} />
              </View>
              <View className="items-center gap-1">
                <Text className="font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('bookings.emptyUpcomingTitle')}</Text>
                <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('bookings.emptyUpcomingBody')}</Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/explore')} className="mt-2 rounded-xl bg-stone-900 px-5 py-3 dark:bg-blue-600">
                <Text className="text-sm font-semibold text-white">{t('bookings.findASalon')}</Text>
              </Pressable>
            </View>
          }
        />
      ) : (
        <FlatList
          data={past}
          keyExtractor={(booking) => booking.id}
          contentContainerClassName="gap-4 px-5 pb-10 pt-5"
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              variant="past"
              onLeaveReview={() => setReviewBookingId(item.id)}
              hasReviewed={reviewedBookingIds?.has(item.id) ?? false}
            />
          )}
          ListEmptyComponent={
            <View className="items-center gap-4 px-4 py-16">
              <View className="size-16 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
                <CalendarX2 size={28} color={colors.muted} />
              </View>
              <Text className="font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('bookings.emptyPastTitle')}</Text>
            </View>
          }
        />
      )}

      <ReviewModal
        visible={reviewBookingId !== null}
        target={reviewTarget}
        title={t('bookings.howWasVisit')}
        subtitle={reviewDetails?.venue?.name ?? reviewDetails?.stylist?.name}
        onClose={() => setReviewBookingId(null)}
      />
    </SafeAreaView>
  )
}
