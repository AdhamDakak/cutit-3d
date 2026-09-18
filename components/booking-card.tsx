import { Image } from 'expo-image'
import { I18nManager, Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { CalendarDays, CalendarX2, HelpCircle, MapPin, PhoneCall, Users } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useAppState } from '@/lib/app-state'
import { ANY_STAFF_ID, getBookingDetails, type Booking } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

type BookingCardProps = {
  booking: Booking
  variant: 'upcoming' | 'past'
  /** Past + completed only — opens the shared review modal for this booking. */
  onLeaveReview?: () => void
}

export function BookingCard({ booking, variant, onLeaveReview }: BookingCardProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { addresses } = useAppState()

  const details = getBookingDetails(booking, addresses)
  const isSalon = booking.bookingType === 'salon'
  const isAnyStaff = booking.staffId === ANY_STAFF_ID
  const title = isSalon ? details.venue?.name : details.stylist?.name
  const area = isSalon ? details.venue?.area : details.address?.area
  const imageUrl = isSalon ? details.venue?.coverImageUrl : details.stylist?.photoUrl
  const serviceNames = details.services.map((service) => service.name).join(', ')

  const isToday = details.startDate.toDateString() === new Date().toDateString()
  const dateTimeLabel = isToday
    ? t('bookings.todayAtShort', { time: details.timeLabel })
    : t('bookings.dateAtShort', { date: details.dateLabel, time: details.timeLabel })

  const locationTypeLabel =
    booking.bookingType === 'salon' ? t('bookings.inSalon') : booking.bookingType === 'events-bridal' ? t('bookings.eventsBridal') : t('bookings.atHome')

  if (variant === 'past' && booking.status === 'cancelled') {
    return (
      <View className="flex-row gap-3 overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <View className="size-16 items-center justify-center rounded-xl bg-stone-100 dark:bg-zinc-800">
          <CalendarX2 size={24} color={colors.muted} />
        </View>
        <View>
          <Text className="text-sm font-semibold text-stone-900 dark:text-white">{title}</Text>
          <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
            {area} · {details.dateLabel}
          </Text>
          <View className={`mt-3 rounded-full bg-stone-200 px-2 py-1 ${I18nManager.isRTL ? 'self-end' : 'self-start'}`}>
            <Text className="text-[10px] font-semibold text-stone-600">{t('bookings.cancelled')}</Text>
          </View>
        </View>
      </View>
    )
  }

  if (variant === 'past') {
    return (
      <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <View className="flex-row gap-3 p-4">
          <Image source={{ uri: imageUrl ?? undefined }} className="size-16 rounded-xl" contentFit="cover" />
          <View className="min-w-0 flex-1">
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="text-sm font-semibold text-stone-900 dark:text-white">
                  {title}
                </Text>
                <Text numberOfLines={1} className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                  {area} · {details.dateLabel}
                </Text>
              </View>
              <View className="rounded-full bg-emerald-100 px-2 py-1">
                <Text className="text-[10px] font-semibold text-emerald-700">{t('bookings.completed')}</Text>
              </View>
            </View>
            <Text className="mt-3 text-sm font-semibold text-stone-900 dark:text-white">{t('bookings.totalPaid', { price: details.priceEGP })}</Text>
          </View>
        </View>
        <View className="flex-row gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
          <Pressable onPress={() => router.push('/(tabs)/explore')} className="flex-1 items-center rounded-xl bg-stone-900 py-2.5 dark:bg-blue-600">
            <Text className="text-xs font-semibold text-white">{t('bookings.rebook')}</Text>
          </Pressable>
          <Pressable onPress={onLeaveReview} className="flex-1 items-center rounded-xl border border-stone-200 py-2.5 dark:border-zinc-700">
            <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{t('bookings.leaveReview')}</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const isPending = booking.status === 'pending'

  return (
    <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <View className="flex-row gap-3 p-4">
        <Image source={{ uri: imageUrl ?? undefined }} className="size-16 rounded-xl" contentFit="cover" />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-sm font-semibold text-stone-900 dark:text-white">
                {title}
              </Text>
              <View className={`mt-1 rounded-full bg-stone-100 px-2 py-1 dark:bg-zinc-800 ${I18nManager.isRTL ? 'self-end' : 'self-start'}`}>
                <Text className="text-[10px] text-stone-600 dark:text-zinc-300">{area}</Text>
              </View>
            </View>
            <View className={`rounded-full px-2 py-1 ${isPending ? 'bg-amber-100' : 'bg-emerald-100'}`}>
              <Text className={`text-[10px] font-semibold ${isPending ? 'text-amber-700' : 'text-emerald-700'}`}>
                {t(isPending ? 'bookings.pending' : 'bookings.confirmed')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mx-4 flex-row items-center gap-3 border-y border-stone-100 py-3 dark:border-zinc-800">
        <View className="size-9 items-center justify-center rounded-full bg-stone-200">
          {isSalon ? (
            isAnyStaff || !details.staff ? (
              <Users size={16} color={colors.mutedStrong} />
            ) : (
              <Text className="text-xs font-semibold text-stone-700">{getInitials(details.staff.name)}</Text>
            )
          ) : (
            <MapPin size={16} color={colors.mutedStrong} />
          )}
        </View>
        <View className="min-w-0 flex-1">
          {isSalon ? (
            isAnyStaff ? (
              <Text numberOfLines={1} className="text-sm font-medium text-stone-900 dark:text-white">
                {t('venue.anyStylist')}
              </Text>
            ) : details.staff ? (
              <Text numberOfLines={1} className="text-sm font-medium text-stone-900 dark:text-white">
                {details.staff.name} <Text className="text-stone-500 dark:text-zinc-400">({details.staff.role})</Text>
              </Text>
            ) : null
          ) : (
            <Text numberOfLines={1} className="text-sm font-medium text-stone-900 dark:text-white">
              {details.address?.label} <Text className="text-stone-500 dark:text-zinc-400">· {details.address?.area}</Text>
            </Text>
          )}
          <Text numberOfLines={1} className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
            {serviceNames} · EGP {details.priceEGP}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-1.5">
          <CalendarDays size={14} color={colors.foreground} />
          <Text className="text-xs font-medium text-stone-900 dark:text-white">{dateTimeLabel}</Text>
        </View>
        <View className="rounded-full bg-stone-100 px-2 py-1 dark:bg-zinc-800">
          <Text className="text-[10px] font-medium text-stone-600 dark:text-zinc-300">{locationTypeLabel}</Text>
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
        <Pressable
          onPress={() => router.push({ pathname: '/help', params: { bookingId: booking.id } })}
          className="flex-row items-center justify-center gap-1.5 py-1"
        >
          <HelpCircle size={14} color={colors.accent} />
          <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">{t('bookings.needHelp')}</Text>
        </Pressable>
      </View>
    </View>
  )
}
