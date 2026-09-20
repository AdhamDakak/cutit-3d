import { useState } from 'react'
import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, Image as ImageIcon, Star } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { ErrorState } from '@/components/error-state'
import { ReviewCard } from '@/components/review-card'
import { ReviewPhotoViewer } from '@/components/review-photo-viewer'
import type { StylistServiceType } from '@/lib/data'
import { useStylist, useStylistReviews, useVenue } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

export default function StylistScreen() {
  const { t } = useTranslation()
  const { id, type } = useLocalSearchParams<{ id: string; type?: StylistServiceType }>()
  const router = useRouter()
  const colors = useThemeColors()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft
  const [viewerPhotos, setViewerPhotos] = useState<string[] | null>(null)
  const [viewerIndex, setViewerIndex] = useState(0)

  const { data: stylist, isLoading: stylistLoading, error: stylistError, refetch: refetchStylist } = useStylist(id)
  const { data: stylistReviewsData, isLoading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useStylistReviews(id)
  const { data: venue } = useVenue(stylist?.venueId ?? undefined)
  const stylistReviews = stylistReviewsData ?? []
  const reviewCount = stylistReviews.length
  const avgRating = reviewCount > 0 ? stylistReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : (stylist?.rating ?? 0)
  const displayReviewCount = reviewCount > 0 ? reviewCount : (stylist?.reviewCount ?? 0)

  const isLoading = stylistLoading || reviewsLoading
  const hasError = stylistError || reviewsError
  const refetchAll = () => {
    refetchStylist()
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

  if (!stylist) return <Redirect href="/(tabs)" />

  const bookStylist = () => {
    router.push({
      pathname: '/go-booking/services',
      params: { stylistId: stylist.id, type: type ?? stylist.serviceTypes[0] },
    })
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
        <Text numberOfLines={1} className="mx-3 flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">
          {stylist.name}
        </Text>
        <View className="size-9" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-28">
        {stylist.photoUrl ? (
          <Image source={{ uri: stylist.photoUrl }} className="h-64 w-full" contentFit="cover" />
        ) : (
          <View className="h-64 w-full items-center justify-center border border-stone-200 bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900">
            <ImageIcon size={32} color={colors.muted} />
            <Text className="mt-2 text-xs text-stone-500 dark:text-zinc-400">{t('stylist.noPhotoYet')}</Text>
          </View>
        )}

        <View className="px-5 py-6">
          <View className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Text className="font-serif text-2xl font-semibold text-stone-900 dark:text-white">{stylist.name}</Text>

            <View className="mt-2 flex-row flex-wrap gap-1.5">
              {stylist.specialties.map((specialty) => (
                <View key={specialty} className="rounded-full bg-stone-100 px-2.5 py-1 dark:bg-zinc-800">
                  <Text className="text-xs text-stone-600 dark:text-zinc-300">{specialty}</Text>
                </View>
              ))}
            </View>

            <View className="mt-3 flex-row items-center gap-1">
              <Star size={16} color={colors.amber} fill={colors.amber} />
              <Text className="font-semibold text-stone-900 dark:text-white">{stylist.rating}</Text>
              <Text className="text-stone-500 dark:text-zinc-400">{t('venue.reviewsCountParen', { count: stylist.reviewCount })}</Text>
            </View>

            <View className="mt-3">
              {stylist.isFreelancer ? (
                <View className={`rounded-full bg-blue-50 px-3 py-1.5 dark:bg-blue-950 ${I18nManager.isRTL ? 'self-end' : 'self-start'}`}>
                  <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300">{t('stylist.freelancer')}</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => venue && router.push(`/venue/${venue.id}`)}
                  className={`rounded-full bg-stone-100 px-3 py-1.5 dark:bg-zinc-800 ${I18nManager.isRTL ? 'self-end' : 'self-start'}`}
                >
                  <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{t('stylist.worksAt', { venue: venue?.name ?? '' })}</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View className="mt-8">
            <Text className="mb-2 font-semibold text-stone-900 dark:text-white">{t('stylist.about')}</Text>
            <Text className="text-sm leading-6 text-stone-600 dark:text-zinc-300">{stylist.bio}</Text>
            <View className="mt-3 gap-1">
              {stylist.yearsExperience != null && (
                <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('stylist.yearsExperience', { count: stylist.yearsExperience })}</Text>
              )}
              <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('stylist.startingFrom', { price: stylist.priceFrom })}</Text>
            </View>
          </View>

          <View className="mt-8">
            <Text className="mb-3 font-semibold text-stone-900 dark:text-white">{t('stylist.availableFor')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {stylist.serviceTypes.map((type) => (
                <View key={type} className="rounded-full border border-stone-200 px-3 py-1.5 dark:border-zinc-700">
                  <Text className="text-xs font-medium text-stone-700 dark:text-zinc-200">
                    {type === 'events-bridal' ? t('cutitGo.eventsTitle') : t('cutitGo.atHomeTitle')}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-8">
            <Text className="mb-3 font-semibold text-stone-900 dark:text-white">{t('stylist.portfolio')}</Text>
            {stylist.portfolioPhotos.length === 0 ? (
              <View className="items-center rounded-xl border border-dashed border-stone-300 bg-white/60 px-6 py-10 dark:border-zinc-700 dark:bg-zinc-900/40">
                <ImageIcon size={24} color={colors.muted} />
                <Text className="mt-2 text-xs text-stone-500 dark:text-zinc-400">{t('stylist.noPortfolioYet')}</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {stylist.portfolioPhotos.map((photo) => (
                  <Image key={photo} source={{ uri: photo }} className="h-28 w-[31%] rounded-lg" contentFit="cover" />
                ))}
              </View>
            )}
          </View>

          <View className="mt-10 border-t border-stone-200/70 pt-6 dark:border-zinc-800">
            <Text className="font-semibold text-stone-900 dark:text-white">{t('venue.customerReviews')}</Text>
            <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{t('stylist.reviewsSubtitle')}</Text>

            <View className="mt-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <View className="flex-row items-center gap-2">
                <Star size={16} color={colors.amber} fill={colors.amber} />
                <Text className="font-semibold text-stone-900 dark:text-white">{avgRating.toFixed(1)}</Text>
                <Text className="text-xs text-stone-500 dark:text-zinc-400">{t('venue.fromReviewsCount', { count: displayReviewCount })}</Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              {stylistReviews.map((review) => (
                <ReviewCard key={review.id} review={review} onOpenPhoto={(photos, index) => { setViewerPhotos(photos); setViewerIndex(index) }} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable onPress={bookStylist} className="items-center rounded-xl bg-blue-600 py-3.5">
          <Text className="font-semibold text-white">{t('stylist.bookButton', { name: stylist.name })}</Text>
        </Pressable>
      </View>

      <ReviewPhotoViewer
        visible={viewerPhotos !== null}
        photos={viewerPhotos ?? []}
        initialIndex={viewerIndex}
        onClose={() => setViewerPhotos(null)}
      />
    </SafeAreaView>
  )
}
