import { Image } from 'expo-image'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Star } from 'lucide-react-native'
import { useRouter } from 'expo-router'

import { getVenueStartingPrice } from '@/lib/api'
import type { Gender } from '@/lib/app-state'
import type { Venue } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

export function RecommendationFeed({
  establishments,
  signedIn,
  gender,
}: {
  establishments: Venue[]
  signedIn: boolean
  gender: Gender
}) {
  const colors = useThemeColors()
  const router = useRouter()
  const recommendations = establishments.filter(
    (item) => !signedIn || item.gender === (gender === 'For Her' ? 'Women' : 'Men') || item.gender === 'Unisex',
  )

  return (
    <View className="px-5 pt-7">
      <View className="mb-4 flex-row items-end justify-between">
        <View>
          <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">Smart picks</Text>
          <Text className="mt-1 font-serif text-2xl font-semibold text-stone-900 dark:text-white">Recommended for You</Text>
        </View>
        <Text className="text-xs text-stone-400 dark:text-zinc-500">{signedIn ? 'Based on your profile' : 'Explore both'}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3 pb-1">
          {recommendations.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/venue/${item.id}`)}
              className="w-56 overflow-hidden rounded-2xl border border-stone-200 bg-white active:opacity-90 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Image source={{ uri: item.coverImageUrl ?? undefined }} className="h-28 w-full" contentFit="cover" />
              <View className="p-3">
                <View className="flex-row items-start justify-between gap-2">
                  <Text numberOfLines={1} className="flex-1 text-sm font-semibold text-stone-900 dark:text-white">
                    {item.name}
                  </Text>
                  <View className="flex-row shrink-0 items-center gap-0.5">
                    <Star size={12} color={colors.amber} fill={colors.amber} />
                    <Text className="text-xs text-stone-700 dark:text-zinc-200">{item.rating}</Text>
                  </View>
                </View>
                <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                  {item.area} · From EGP {getVenueStartingPrice(item.id)}
                </Text>
                <View className="mt-2 flex-row items-center gap-1">
                  <View className="rounded-full bg-stone-100 px-2 py-1 dark:bg-zinc-800">
                    <Text className="text-[10px] text-stone-600 dark:text-zinc-300">{item.servicesOffered[0]}</Text>
                  </View>
                  <Pressable
                    onPress={() => router.push(`/venue/${item.id}`)}
                    className="ml-auto rounded-lg bg-stone-900 px-2.5 py-1.5 active:opacity-90 dark:bg-blue-600"
                  >
                    <Text className="text-[10px] font-semibold text-white">Book</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
