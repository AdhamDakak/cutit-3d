import { useMemo, useState } from 'react'
import { I18nManager, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, Heart, Image as ImageIcon, MapPin, Search, Star, UserRound, Users } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { CheckoutAuthSheet } from '@/components/checkout-auth-sheet'
import { ErrorState } from '@/components/error-state'
import { ReviewModal } from '@/components/review-modal'
import { ANY_STAFF_ID, type CreateBookingInput, type ListSlotsParams } from '@/lib/api'
import { useAppState } from '@/lib/app-state'
import { useCreateBooking, useFavorites, useSlots, useToggleFavorite, useVenue, useVenueReviews, useVenueServices, useVenueStaff } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

const FAVORITE_RED = '#ef4444'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

type Period = 'Morning' | 'Afternoon' | 'Evening'

function getSlotPeriod(startTime: string): Period {
  const hour = new Date(startTime).getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

export default function VenueScreen() {
  const { t, i18n } = useTranslation()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colors = useThemeColors()
  const { isSignedIn } = useAppState()

  const { data: establishment, isLoading: venueLoading, error: venueError, refetch: refetchVenue } = useVenue(id)
  const { data: venueStaffData, isLoading: staffLoading, error: staffError, refetch: refetchStaff } = useVenueStaff(id)
  const { data: venueServicesData, isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = useVenueServices(id)
  const { data: venueReviewsData, isLoading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useVenueReviews(id)
  const { data: favoriteVenueIds } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()
  const { mutate: createBooking, isPending: isConfirming, error: confirmError } = useCreateBooking()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft
  const periodLabels: Record<Period, string> = {
    Morning: t('venue.periodMorning'),
    Afternoon: t('venue.periodAfternoon'),
    Evening: t('venue.periodEvening'),
  }
  const dayFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }), [i18n.language])

  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [serviceQuery, setServiceQuery] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      return date
    })
  }, [])

  const venueServices = venueServicesData ?? []
  const venueStaff = venueStaffData ?? []
  const venueReviews = venueReviewsData ?? []

  const totalPrice = Array.from(selectedServices).reduce((sum, serviceId) => {
    const service = venueServices.find((item) => item.id === serviceId)
    return sum + (service?.priceEGP ?? 0)
  }, 0)
  const filteredServices = venueServices.filter((service) => service.name.toLowerCase().includes(serviceQuery.toLowerCase()))
  const canConfirm = selectedServices.size > 0 && !!selectedTime && selectedStaff !== null

  const selectedDurationMinutes =
    Array.from(selectedServices).reduce((sum, serviceId) => {
      const service = venueServices.find((item) => item.id === serviceId)
      return sum + (service?.durationMinutes ?? 0)
    }, 0) || 30
  // Falls back to the same "no preference" sentinel used when the user
  // explicitly taps "Any stylist", so browsing before picking anyone and
  // picking "Any stylist" behave identically — one convention, not two.
  const effectiveStaffId = selectedStaff ?? ANY_STAFF_ID
  const representativeServiceId = Array.from(selectedServices)[0] ?? venueServices[0]?.id ?? ''
  const slotsParams: ListSlotsParams | null =
    establishment && representativeServiceId
      ? {
          venueId: establishment.id,
          staffId: effectiveStaffId,
          serviceId: representativeServiceId,
          date: dates[selectedDate],
          durationMinutes: selectedDurationMinutes,
        }
      : null
  const { data: daySlots = [] } = useSlots(slotsParams)

  const isLoading = venueLoading || staffLoading || servicesLoading || reviewsLoading
  const hasError = venueError || staffError || servicesError || reviewsError
  const refetchAll = () => {
    refetchVenue()
    refetchStaff()
    refetchServices()
    refetchReviews()
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800">
            <BackIcon size={18} color={colors.foreground} />
          </Pressable>
          <View className="size-9" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (hasError) {
    return (
      <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800">
            <BackIcon size={18} color={colors.foreground} />
          </Pressable>
          <View className="size-9" />
        </View>
        <ErrorState onRetry={refetchAll} />
      </SafeAreaView>
    )
  }

  if (!establishment) return <Redirect href="/(tabs)" />

  const favorited = favoriteVenueIds?.has(establishment.id) ?? false

  const submitBooking = async () => {
    if (!selectedTime) return
    const endTime = new Date(new Date(selectedTime).getTime() + selectedDurationMinutes * 60_000).toISOString()
    const input: CreateBookingInput = {
      bookingType: 'salon',
      venueId: establishment.id,
      staffId: selectedStaff,
      stylistId: null,
      addressId: null,
      serviceIds: Array.from(selectedServices),
      startTime: selectedTime,
      endTime,
      priceEGP: totalPrice,
    }
    try {
      const booking = await createBooking(input)
      router.replace(`/booking-confirmation?bookingId=${booking.id}`)
    } catch {
      // confirmError below already surfaces this in the UI
    }
  }

  // Guests reach Confirm with their selections intact; the account is
  // created here, in a sheet over this screen, and then the same submit runs.
  const confirmBooking = () => {
    if (!isSignedIn) {
      setAuthOpen(true)
      return
    }
    void submitBooking()
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800">
          <BackIcon size={18} color={colors.foreground} />
        </Pressable>
        <Text numberOfLines={1} className="mx-3 flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">
          {establishment.name}
        </Text>
        <Pressable
          onPress={() => toggleFavorite(establishment.id).catch(() => {})}
          accessibilityLabel={t(favorited ? 'common.removeFromFavorites' : 'common.addToFavorites', { name: establishment.name })}
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <Heart size={18} color={favorited ? FAVORITE_RED : colors.foreground} fill={favorited ? FAVORITE_RED : 'transparent'} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-28">
        {establishment.coverImageUrl ? (
          <Image source={{ uri: establishment.coverImageUrl }} className="h-64 w-full" contentFit="cover" />
        ) : (
          <View className="h-64 w-full items-center justify-center border border-stone-200 bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900">
            <ImageIcon size={32} color={colors.muted} />
            <Text className="mt-2 text-xs text-stone-500 dark:text-zinc-400">{t('venue.noPhotoYet')}</Text>
          </View>
        )}

        <View className="px-5 py-6">
          <View className="flex-row items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <View>
              <Text className="font-serif text-2xl font-semibold text-stone-900 dark:text-white">{establishment.name}</Text>
              <View className="mt-2 flex-row items-center gap-1.5">
                <MapPin size={16} color={colors.muted} />
                <Text className="text-stone-500 dark:text-zinc-400">{establishment.area}</Text>
              </View>
              <View className="mt-3 flex-row items-center gap-1">
                <Star size={16} color={colors.amber} fill={colors.amber} />
                <Text className="font-semibold text-stone-900 dark:text-white">{establishment.rating}</Text>
                <Text className="text-stone-500 dark:text-zinc-400">{t('venue.reviewsCountParen', { count: establishment.reviewCount })}</Text>
              </View>
            </View>
          </View>

          <View className="mt-8">
            <Text className="mb-4 font-semibold text-stone-900 dark:text-white">{t('venue.selectStylist')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setSelectedStaff(ANY_STAFF_ID)}
                  className={`items-center gap-2 rounded-lg px-3 py-2 ${selectedStaff === ANY_STAFF_ID ? 'bg-stone-900 dark:bg-blue-600' : 'bg-stone-100 dark:bg-zinc-800'}`}
                >
                  <View className="size-10 items-center justify-center rounded-full bg-stone-300 dark:bg-zinc-600">
                    <Users size={18} color={colors.mutedStrong} />
                  </View>
                  <View className="items-center">
                    <Text className={`text-xs ${selectedStaff === ANY_STAFF_ID ? 'text-white' : 'text-stone-900 dark:text-white'}`}>{t('venue.anyStylist')}</Text>
                    <Text className={`text-[10px] ${selectedStaff === ANY_STAFF_ID ? 'text-white/80' : 'text-stone-500 dark:text-zinc-400'}`}>
                      {t('venue.firstAvailable')}
                    </Text>
                  </View>
                </Pressable>
                {venueStaff.map((person) => {
                  const active = selectedStaff === person.id
                  return (
                    <Pressable
                      key={person.id}
                      onPress={() => setSelectedStaff(person.id)}
                      className={`items-center gap-2 rounded-lg px-3 py-2 ${active ? 'bg-stone-900 dark:bg-blue-600' : 'bg-stone-100 dark:bg-zinc-800'}`}
                    >
                      {person.photoUrl ? (
                        <Image source={{ uri: person.photoUrl }} className="size-10 rounded-full" />
                      ) : (
                        <View className="size-10 items-center justify-center rounded-full bg-stone-300 dark:bg-zinc-600">
                          <UserRound size={18} color={colors.mutedStrong} />
                        </View>
                      )}
                      <View className="items-center">
                        <Text className={`text-xs ${active ? 'text-white' : 'text-stone-900 dark:text-white'}`}>{person.name}</Text>
                        <Text className={`text-[10px] ${active ? 'text-white/80' : 'text-stone-500 dark:text-zinc-400'}`}>{person.role}</Text>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </ScrollView>
            {selectedStaff === null && <Text className="mt-2 text-xs text-amber-600 dark:text-amber-500">{t('venue.chooseStylistHint')}</Text>}
          </View>

          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between gap-3">
              <Text className="font-semibold text-stone-900 dark:text-white">{t('venue.selectServices')}</Text>
              <Text className="text-xs text-stone-500 dark:text-zinc-400">{t('venue.optionsCount', { count: venueServices.length })}</Text>
            </View>
            <View className="mb-3 flex-row items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900">
              <Search size={16} color={colors.muted} />
              <TextInput
                value={serviceQuery}
                onChangeText={setServiceQuery}
                placeholder={t('venue.searchServices')}
                placeholderTextColor={colors.muted}
                className="min-w-0 flex-1 text-sm text-stone-900 dark:text-white"
              />
            </View>
            <View className="gap-3">
              {filteredServices.map((service) => {
                const selected = selectedServices.has(service.id)
                return (
                  <Pressable
                    key={service.id}
                    onPress={() => {
                      const next = new Set(selectedServices)
                      if (next.has(service.id)) next.delete(service.id)
                      else next.add(service.id)
                      setSelectedServices(next)
                    }}
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
          </View>

          <View className="mt-8">
            <Text className="mb-4 font-semibold text-stone-900 dark:text-white">{t('venue.selectDate')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {dates.map((date, idx) => {
                  const active = selectedDate === idx
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => setSelectedDate(idx)}
                      className={`items-center rounded-lg px-4 py-3 ${active ? 'bg-stone-900 dark:bg-blue-600' : 'border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'}`}
                    >
                      <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-stone-500 dark:text-zinc-400'}`}>{dayFormatter.format(date)}</Text>
                      <Text className={`text-lg font-bold ${active ? 'text-white' : 'text-stone-900 dark:text-white'}`}>{date.getDate()}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </ScrollView>
          </View>

          <View className="mt-8 gap-4">
            <Text className="font-semibold text-stone-900 dark:text-white">{t('venue.selectTime')}</Text>
            {daySlots.length === 0 && <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('venue.noAvailability')}</Text>}
            {(['Morning', 'Afternoon', 'Evening'] as const).map((period) => {
              const periodSlots = daySlots.filter((slot) => getSlotPeriod(slot.startTime) === period)
              if (periodSlots.length === 0) return null
              return (
                <View key={period}>
                  <Text className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-zinc-400">{periodLabels[period]}</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {periodSlots.map((slot) => {
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
              )
            })}
          </View>

          <View className="mt-10 border-t border-stone-200/70 pt-6 dark:border-zinc-800">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-stone-900 dark:text-white">{t('venue.customerReviews')}</Text>
                <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{t('venue.reviewsSubtitle')}</Text>
              </View>
              <Pressable onPress={() => setReviewOpen(true)} className="rounded-xl bg-blue-600 px-3 py-2">
                <Text className="text-xs font-semibold text-white">{t('venue.writeReview')}</Text>
              </Pressable>
            </View>
            <View className="mt-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <View className="flex-row items-center gap-2">
                <Star size={16} color={colors.amber} fill={colors.amber} />
                <Text className="font-semibold text-stone-900 dark:text-white">{establishment.rating}</Text>
                <Text className="text-xs text-stone-500 dark:text-zinc-400">{t('venue.fromReviewsCount', { count: establishment.reviewCount })}</Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              {venueReviews.map((review) => (
                <View key={review.id} className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="size-8 items-center justify-center rounded-full bg-stone-200 dark:bg-zinc-700">
                        <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{getInitials(review.authorName)}</Text>
                      </View>
                      <Text className="text-sm font-medium text-stone-900 dark:text-white">{review.authorName}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Star size={12} color={colors.amber} fill={colors.amber} />
                      <Text className="text-xs font-semibold text-stone-900 dark:text-white">{review.rating}</Text>
                    </View>
                  </View>
                  <Text className="mt-2 text-sm leading-5 text-stone-600 dark:text-zinc-300">{review.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        {confirmError ? <Text className="mb-2 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs uppercase tracking-widest text-stone-500 dark:text-zinc-400">{t('venue.total')}</Text>
            <Text className="text-2xl font-bold text-stone-900 dark:text-white">{t('venue.priceEGP', { price: totalPrice })}</Text>
          </View>
          <Pressable disabled={!canConfirm || isConfirming} onPress={confirmBooking} className="rounded-xl bg-blue-600 px-6 py-3 disabled:opacity-50">
            <Text className="font-semibold text-white">{t(isConfirming ? 'venue.confirmingBooking' : 'venue.confirmBooking')}</Text>
          </Pressable>
        </View>
      </View>

      <ReviewModal
        visible={reviewOpen}
        title={t('venue.writeReview')}
        onClose={() => setReviewOpen(false)}
        onSubmit={() => {}}
      />

      <CheckoutAuthSheet
        visible={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={() => {
          setAuthOpen(false)
          void submitBooking()
        }}
      />
    </SafeAreaView>
  )
}
