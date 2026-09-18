import { Image } from 'expo-image'
import { I18nManager, Pressable, Text, View } from 'react-native'
import { Star, UserRound } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { Stylist } from '@/lib/data'
import { useVenue } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

type StylistCardProps = {
  stylist: Stylist
  /** Callers that already have the venue list loaded (e.g. booking-flow.tsx) can pass this to skip this card's own fetch. */
  venueName?: string
  onPress: () => void
}

export function StylistCard({ stylist, venueName, onPress }: StylistCardProps) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  // Only fetched here when the caller didn't already resolve it.
  const { data: fetchedVenue } = useVenue(venueName === undefined && stylist.venueId ? stylist.venueId : undefined)
  const resolvedVenueName = venueName ?? fetchedVenue?.name ?? ''

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 active:opacity-90 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {stylist.photoUrl ? (
        <Image source={{ uri: stylist.photoUrl }} className="size-16 rounded-full" />
      ) : (
        <View className="size-16 items-center justify-center rounded-full bg-stone-200 dark:bg-zinc-700">
          <UserRound size={24} color={colors.mutedStrong} />
        </View>
      )}

      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="font-serif text-base font-semibold text-stone-900 dark:text-white">
          {stylist.name}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
          {stylist.specialties.join(' · ')}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
          {stylist.isFreelancer ? t('stylist.freelancer') : t('stylist.worksAt', { venue: resolvedVenueName })}
        </Text>
        <Text className="mt-1 text-xs font-semibold text-stone-900 dark:text-white">{t('venue.priceEGP', { price: stylist.priceFrom })}</Text>
      </View>

      {/* Rating block sits last in the row, so it lands on the logical end
          automatically (flex-row auto-mirrors under RTL). Its own internal
          alignment doesn't auto-mirror though — that's a cross-axis
          property, same category as the self-start/self-end bug found
          earlier in the RTL audit — hence the explicit conditional. */}
      <View className={`shrink-0 gap-0.5 ${I18nManager.isRTL ? 'items-start' : 'items-end'}`}>
        <View className="flex-row items-center gap-1">
          <Star size={12} color={colors.amber} fill={colors.amber} />
          <Text className="text-xs font-semibold text-stone-900 dark:text-white">{stylist.rating}</Text>
        </View>
        <Text className="text-[10px] text-stone-400 dark:text-zinc-500">({stylist.reviewCount})</Text>
      </View>
    </Pressable>
  )
}
