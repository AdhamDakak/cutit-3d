import { useMemo, useState } from 'react'
import { I18nManager, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { AppHeader } from '@/components/app-header'
import { ErrorState } from '@/components/error-state'
import { EstablishmentCard } from '@/components/establishment-card'
import { RecommendationFeed } from '@/components/recommendation-feed'
import { SkeletonCard } from '@/components/skeleton-card'
import { useAppState } from '@/lib/app-state'
import type { Gender } from '@/lib/data'
import { useContentGender, useCurrentUser, useVenues, useVenueServiceCategories } from '@/lib/hooks'
import { useUserLocation } from '@/lib/location'
import { tracking } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

const ForwardChevron = I18nManager.isRTL ? ChevronLeft : ChevronRight

export default function HomeScreen() {
  const { t } = useTranslation()
  const { isSignedIn, guestGender, setGuestGender } = useAppState()
  const colors = useThemeColors()
  const router = useRouter()
  const contentGender = useContentGender()
  const { data: user } = useCurrentUser()
  // null = "All services"; otherwise a service category from the chips below.
  const [service, setService] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  // Never prompts here (Explore does that); once location is granted, "Near you" is sorted by real distance.
  // Venues already come back matched to the content gender, so the feed and "Near you" both follow it.
  const userLocation = useUserLocation({ prompt: false })
  const { data: venuesData, isLoading: venuesLoading, error: venuesError, refetch: refetchVenues } = useVenues({
    gender: contentGender,
    ...(userLocation ? { location: userLocation } : null),
  })
  const venues = venuesData ?? []

  // Chips are the service categories those venues actually offer, so every chip has venues behind it — and they
  // differ by gender. A chip that disappears after a gender switch falls back to "All services".
  const { data: categories } = useVenueServiceCategories(venues.map((venue) => venue.id))
  const activeCategory = categories?.find((option) => option.category === service) ?? null

  const filtered = useMemo(() => {
    return venues.filter((item) => {
      const serviceMatch = !activeCategory || activeCategory.venueIds.includes(item.id)
      const search = `${item.name} ${item.area} ${item.category} ${item.servicesOffered.join(' ')}`.toLowerCase()
      return serviceMatch && search.includes(query.toLowerCase())
    })
  }, [venues, activeCategory, query])

  const resetFilters = () => {
    setService(null)
    setQuery('')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top']}>
      <AppHeader />
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <RecommendationFeed establishments={venues} signedIn={isSignedIn} />

        <View className="px-5 pt-7">
          <Text className="text-sm font-medium text-stone-500 dark:text-zinc-400">{isSignedIn && user?.firstName ? t('home.greeting', { name: user.firstName }) : t('home.greetingGuest')}</Text>
          <Text className={`mt-1 font-serif text-3xl font-semibold leading-tight ${tracking('tracking-tight')} text-stone-900 dark:text-white`}>
            {t('home.headlinePrefix')} <Text className="font-normal text-stone-500 dark:text-zinc-400">{t('home.headlineSuffix')}</Text>
          </Text>
        </View>

        {/* Guests pick what to browse; signed in, content follows the profile's gender (edit it in Profile). */}
        {!isSignedIn ? (
          <View className="px-5 pt-5">
            <View className="flex-row rounded-xl bg-stone-200/70 p-1 dark:bg-zinc-800">
              {(['female', 'male'] as Gender[]).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setGuestGender(option)}
                  className={`flex-1 items-center rounded-lg py-2.5 ${guestGender === option ? 'bg-white dark:bg-zinc-900' : ''}`}
                >
                  <Text className={`text-sm font-medium ${guestGender === option ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-zinc-400'}`}>
                    {t(`gender.${option}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
            <Search size={16} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor={colors.muted}
              textAlignVertical="center"
              style={{ fontSize: 14, lineHeight: 18 }}
              className="min-w-0 flex-1 text-sm text-stone-900 dark:text-white"
            />
            {query.length > 0 && (
              <Pressable accessibilityLabel={t('home.clearSearch')} onPress={() => setQuery('')}>
                <X size={16} color={colors.muted} />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-4">
          <View className="flex-row items-center gap-2">
            {[null, ...(categories ?? []).map((option) => option.category)].map((category) => {
              const selected = (activeCategory?.category ?? null) === category
              return (
                <Pressable
                  key={category ?? 'all'}
                  onPress={() => setService(category)}
                  className={`rounded-full border px-3.5 py-2 ${
                    selected ? 'border-stone-900 bg-stone-900 dark:border-blue-500 dark:bg-blue-600' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                  }`}
                >
                  <Text className={`text-xs font-medium ${selected ? 'text-white' : 'text-stone-600 dark:text-zinc-400'}`}>
                    {t(category ? `serviceCategoryLabels.${category}` : 'serviceCategoryLabels.all', { defaultValue: category ?? '' })}
                  </Text>
                </Pressable>
              )
            })}
            <Pressable accessibilityLabel={t('home.openFilters')} className="size-8 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <SlidersHorizontal size={14} color={colors.muted} />
            </Pressable>
          </View>
        </ScrollView>

        <View className="mx-5 flex-row items-center justify-between rounded-2xl bg-[#e7dfd3] px-4 py-3.5 dark:bg-zinc-800">
          <View className="flex-row items-center gap-3">
            <View className="size-9 items-center justify-center rounded-xl bg-white/70 dark:bg-zinc-700">
              <CalendarDays size={16} color={colors.mutedStrong} />
            </View>
            <View>
              <Text className="text-xs font-semibold text-stone-800 dark:text-white">{t('home.refreshBannerTitle')}</Text>
              <Text className="mt-0.5 text-[11px] text-stone-600 dark:text-zinc-400">{t('home.refreshBannerSubtitle')}</Text>
            </View>
          </View>
          <Pressable className="size-8 items-center justify-center rounded-full bg-stone-900 dark:bg-zinc-900">
            <ForwardChevron size={16} color="#ffffff" />
          </Pressable>
        </View>

        <View className="px-5 pt-7">
          <View className="mb-4 flex-row items-end justify-between">
            <View>
              <Text className={`text-[11px] font-medium uppercase ${tracking('tracking-[3px]')} text-stone-500 dark:text-zinc-500`}>{t('home.curatedForYou')}</Text>
              <Text className={`mt-1 font-serif text-2xl font-semibold ${tracking('tracking-tight')} text-stone-900 dark:text-white`}>
                {t('home.nearYou')} <Text className="font-sans text-sm font-normal text-stone-500 dark:text-zinc-400">({filtered.length})</Text>
              </Text>
            </View>
            <Pressable onPress={() => refetchVenues()} className="flex-row items-center gap-1">
              <RotateCcw size={14} color={colors.mutedStrong} />
              <Text className="text-xs font-semibold text-stone-500 dark:text-zinc-400">{t('home.refresh')}</Text>
            </Pressable>
          </View>

          {venuesLoading ? (
            <View className="gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : venuesError ? (
            <ErrorState onRetry={refetchVenues} />
          ) : filtered.length > 0 ? (
            <View className="gap-4">
              {filtered.map((establishment) => (
                <EstablishmentCard key={establishment.id} establishment={establishment} onPress={() => router.push(`/venue/${establishment.id}`)} />
              ))}
            </View>
          ) : (
            <View className="items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 dark:border-zinc-700 dark:bg-zinc-900/40">
              <View className="size-14 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
                <Search size={24} color={colors.muted} />
              </View>
              <Text className="mt-5 font-serif text-xl font-semibold text-stone-900 dark:text-white">{t('home.emptyTitle')}</Text>
              <Text className="mt-2 max-w-xs text-center text-sm leading-6 text-stone-500 dark:text-zinc-400">
                {t('home.emptyBody')}
              </Text>
              <Pressable onPress={resetFilters} className="mt-5 rounded-xl bg-stone-900 px-5 py-3 dark:bg-blue-600">
                <Text className="text-sm font-semibold text-white">{t('home.resetFilters')}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
