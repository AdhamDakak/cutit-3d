import { useState } from 'react'
import { Image } from 'expo-image'
import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  Bell,
  CalendarDays,
  CalendarX2,
  Clock3,
  HelpCircle,
  MapPin,
  PhoneCall,
} from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { ReviewModal } from '@/components/review-modal'
import { useAppState } from '@/lib/app-state'
import { currentUser, services, staff, venues, type Booking } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

type Tab = 'Upcoming' | 'Past History'

function getBookingDetails(booking: Booking) {
  const venue = venues.find((item) => item.id === booking.venueId)
  const bookingStaff = staff.find((item) => item.id === booking.staffId)
  // First matching service only — the existing UI shows a single
  // service name; showing all of a multi-service Cutit Go booking is a
  // later polish pass, not part of this data-model change.
  const service = services.find((item) => booking.serviceIds.includes(item.id))
  const startDate = new Date(booking.startTime)
  return {
    venue,
    staff: bookingStaff,
    service,
    startDate,
    priceEGP: booking.priceEGP,
    bookingType: booking.bookingType,
    dateLabel: startDate.toLocaleDateString([], { month: 'long', day: '2-digit', year: 'numeric' }),
    timeLabel: startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  }
}

export default function BookingsScreen() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('Upcoming')
  const [reviewOpen, setReviewOpen] = useState(false)
  const colors = useThemeColors()
  const router = useRouter()
  const { bookings } = useAppState()

  const myBookings = bookings.filter((booking) => booking.userId === currentUser.id)
  // .find() picks the first match, same as before this was switched from a
  // static mock array to the live app-state list — showing the *soonest*
  // upcoming booking once multiple can exist is a later polish item.
  const upcomingBooking = myBookings.find((booking) => booking.status === 'confirmed')
  const pastBooking = myBookings.find((booking) => booking.status === 'completed')
  const cancelledBooking = myBookings.find((booking) => booking.status === 'cancelled')

  // Guaranteed present in mock data — one booking per status.
  const upcoming = getBookingDetails(upcomingBooking!)
  const past = getBookingDetails(pastBooking!)
  const cancelled = getBookingDetails(cancelledBooking!)

  const minutesUntil = Math.max(0, Math.round((upcoming.startDate.getTime() - Date.now()) / 60000))
  const hoursUntil = Math.floor(minutesUntil / 60)
  const remainderMinutes = minutesUntil % 60

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

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-10 pt-5">
        {tab === 'Upcoming' ? (
          <>
            <View className="flex-row items-center gap-3 rounded-2xl bg-blue-50 px-4 py-4 dark:bg-blue-950/50">
              <View className="size-10 items-center justify-center rounded-xl bg-blue-600">
                <Clock3 size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {t('bookings.appointmentIn', { count: hoursUntil, minutes: remainderMinutes })}
                </Text>
                <Text className="mt-1 text-xs text-blue-900/70 dark:text-blue-100/70">{t('bookings.todayAt', { time: upcoming.timeLabel })}</Text>
              </View>
            </View>

            <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <View className="flex-row gap-3 p-4">
                <Image source={{ uri: upcoming.venue?.coverImageUrl ?? undefined }} className="size-16 rounded-xl" contentFit="cover" />
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <View>
                      <Text numberOfLines={1} className="text-sm font-semibold text-stone-900 dark:text-white">{upcoming.venue?.name}</Text>
                      <View className={`mt-1 rounded-full bg-stone-100 px-2 py-1 dark:bg-zinc-800 ${I18nManager.isRTL ? 'self-end' : 'self-start'}`}>
                        <Text className="text-[10px] text-stone-600 dark:text-zinc-300">{upcoming.venue?.area}</Text>
                      </View>
                    </View>
                    <View className="rounded-full bg-emerald-100 px-2 py-1">
                      <Text className="text-[10px] font-semibold text-emerald-700">{t('bookings.confirmed')}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="mx-4 flex-row items-center gap-3 border-y border-stone-100 py-3 dark:border-zinc-800">
                <View className="size-9 items-center justify-center rounded-full bg-stone-200">
                  <Text className="text-xs font-semibold text-stone-700">KA</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-stone-900 dark:text-white">
                    {upcoming.staff?.name} <Text className="text-stone-500 dark:text-zinc-400">({upcoming.staff?.role})</Text>
                  </Text>
                  <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                    {upcoming.service?.name} · EGP {upcoming.priceEGP}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-row items-center gap-1.5">
                  <CalendarDays size={14} color={colors.foreground} />
                  <Text className="text-xs font-medium text-stone-900 dark:text-white">{t('bookings.todayAtShort', { time: upcoming.timeLabel })}</Text>
                </View>
                <View className="rounded-full bg-stone-100 px-2 py-1 dark:bg-zinc-800">
                  <Text className="text-[10px] font-medium text-stone-600 dark:text-zinc-300">
                    {upcoming.bookingType === 'salon'
                      ? t('bookings.inSalon')
                      : upcoming.bookingType === 'events-bridal'
                        ? t('bookings.eventsBridal')
                        : t('bookings.atHome')}
                  </Text>
                </View>
              </View>
              <View className="gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
                <View className="flex-row gap-2">
                  <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-stone-200 py-2.5 dark:border-zinc-700">
                    <PhoneCall size={14} color={colors.mutedStrong} />
                    <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{t('bookings.callVenue')}</Text>
                  </Pressable>
                  <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-stone-200 py-2.5 dark:border-zinc-700">
                    <MapPin size={14} color={colors.mutedStrong} />
                    <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{t('bookings.getDirections')}</Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => router.push('/help')} className="flex-row items-center justify-center gap-1.5 py-1">
                  <HelpCircle size={14} color={colors.accent} />
                  <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">{t('bookings.needHelp')}</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <View className="flex-row gap-3 p-4">
                <Image source={{ uri: past.venue?.coverImageUrl ?? undefined }} className="size-16 rounded-xl" contentFit="cover" />
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <View>
                      <Text numberOfLines={1} className="text-sm font-semibold text-stone-900 dark:text-white">{past.venue?.name}</Text>
                      <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{past.venue?.area} · {past.dateLabel}</Text>
                    </View>
                    <View className="rounded-full bg-emerald-100 px-2 py-1">
                      <Text className="text-[10px] font-semibold text-emerald-700">{t('bookings.completed')}</Text>
                    </View>
                  </View>
                  <Text className="mt-3 text-sm font-semibold text-stone-900 dark:text-white">{t('bookings.totalPaid', { price: past.priceEGP })}</Text>
                </View>
              </View>
              <View className="flex-row gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
                <Pressable onPress={() => router.push('/(tabs)/explore')} className="flex-1 items-center rounded-xl bg-stone-900 py-2.5 dark:bg-blue-600">
                  <Text className="text-xs font-semibold text-white">{t('bookings.rebook')}</Text>
                </Pressable>
                <Pressable onPress={() => setReviewOpen(true)} className="flex-1 items-center rounded-xl border border-stone-200 py-2.5 dark:border-zinc-700">
                  <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{t('bookings.leaveReview')}</Text>
                </Pressable>
              </View>
            </View>

            <View className="flex-row gap-3 overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <View className="size-16 items-center justify-center rounded-xl bg-stone-100 dark:bg-zinc-800">
                <CalendarX2 size={24} color={colors.muted} />
              </View>
              <View>
                <Text className="text-sm font-semibold text-stone-900 dark:text-white">{cancelled.venue?.name}</Text>
                <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{cancelled.venue?.area} · {cancelled.dateLabel}</Text>
                <View className={`mt-3 rounded-full bg-stone-200 px-2 py-1 ${I18nManager.isRTL ? 'self-end' : 'self-start'}`}>
                  <Text className="text-[10px] font-semibold text-stone-600">{t('bookings.cancelled')}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <ReviewModal
        visible={reviewOpen}
        title={t('bookings.howWasVisit')}
        subtitle={past.venue?.name}
        onClose={() => setReviewOpen(false)}
        onSubmit={() => {}}
      />
    </SafeAreaView>
  )
}
