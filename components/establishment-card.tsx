import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'
import { Heart, Home, MapPin, Star } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { getVenueStartingPrice, isVenueOpenNow } from '@/lib/api'
import type { Venue } from '@/lib/data'
import { useFavorites, useToggleFavorite } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

const FAVORITE_RED = '#ef4444'

export function EstablishmentCard({ establishment, onPress }: { establishment: Venue; onPress: () => void }) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const { data: favoriteVenueIds } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()
  const favorited = favoriteVenueIds?.has(establishment.id) ?? false
  const visibleServices = establishment.servicesOffered.slice(0, 2)
  const remainingCount = establishment.servicesOffered.length - 2
  const isOpen = isVenueOpenNow(establishment.openingHours)
  const startingPrice = getVenueStartingPrice(establishment.id)

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white active:opacity-90 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <View className="relative h-36 bg-stone-200 dark:bg-zinc-800">
        <Image source={{ uri: establishment.coverImageUrl ?? undefined }} className="h-full w-full" contentFit="cover" />
        <View className="absolute inset-x-0 top-0 flex-row items-center justify-between p-2.5">
          <View className={`rounded-full px-2 py-1 ${isOpen ? 'bg-white/95' : 'bg-stone-900/75'}`}>
            <Text className={`text-[10px] font-semibold ${isOpen ? 'text-emerald-700' : 'text-white'}`}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
          <View className="rounded-full bg-stone-950/65 px-2 py-1">
            <Text className="text-[10px] font-medium text-white">{establishment.category}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => toggleFavorite(establishment.id)}
          accessibilityLabel={t(favorited ? 'common.removeFromFavorites' : 'common.addToFavorites', { name: establishment.name })}
          className="absolute bottom-2 end-2 size-8 items-center justify-center rounded-full bg-white/90"
        >
          <Heart size={14} color={favorited ? FAVORITE_RED : colors.mutedStrong} fill={favorited ? FAVORITE_RED : 'transparent'} />
        </Pressable>
      </View>

      <View className="gap-3 p-3">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="font-serif text-base font-semibold tracking-tight text-stone-900 dark:text-white">
              {establishment.name}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1">
              <MapPin size={12} color={colors.muted} />
              <Text className="text-xs text-stone-500 dark:text-zinc-400">{establishment.area}</Text>
            </View>
          </View>
          <View className="flex-row shrink-0 items-center gap-1">
            <Star size={12} color={colors.amber} fill={colors.amber} />
            <Text className="text-xs font-medium text-stone-700 dark:text-zinc-200">{establishment.rating}</Text>
            <Text className="text-[10px] text-stone-400 dark:text-zinc-500">({establishment.reviewCount})</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap items-center gap-1">
          {visibleServices.map((service: string) => (
            <View key={service} className="rounded-full bg-stone-100 px-2 py-0.5 dark:bg-zinc-800">
              <Text className="text-[10px] text-stone-600 dark:text-zinc-300">{service}</Text>
            </View>
          ))}
          {remainingCount > 0 && (
            <View className="rounded-full bg-stone-100 px-2 py-0.5 dark:bg-zinc-800">
              <Text className="text-[10px] text-stone-600 dark:text-zinc-300">+{remainingCount}</Text>
            </View>
          )}
          <View className="ml-auto flex-row items-center gap-1 rounded-full border border-stone-200 px-2 py-0.5 dark:border-zinc-700">
            <Home size={10} color={colors.muted} />
            <Text className="text-[10px] text-stone-500 dark:text-zinc-400">At Salon</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between gap-2 border-t border-stone-100 pt-2 dark:border-zinc-800">
          <View>
            <Text className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-zinc-500">From</Text>
            <Text className="mt-0.5 text-xs font-semibold text-stone-900 dark:text-white">EGP {startingPrice}</Text>
          </View>
          <Pressable onPress={onPress} className="rounded-lg bg-stone-900 px-3 py-2 active:opacity-90 dark:bg-blue-600">
            <Text className="text-xs font-semibold text-white">Book</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  )
}
