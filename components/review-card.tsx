import { Pressable, ScrollView, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Star } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { Review } from '@/lib/data'
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

export function ReviewCard({ review, onOpenPhoto }: { review: Review; onOpenPhoto: (photos: string[], index: number) => void }) {
  const { i18n } = useTranslation()
  const colors = useThemeColors()
  const dateLabel = new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(review.createdAt))

  return (
    <View className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="size-8 items-center justify-center rounded-full bg-stone-200 dark:bg-zinc-700">
            <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{getInitials(review.authorName)}</Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-stone-900 dark:text-white">{review.authorName}</Text>
            <Text className="text-[11px] text-stone-400 dark:text-zinc-500">{dateLabel}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <Star size={12} color={colors.amber} fill={colors.amber} />
          <Text className="text-xs font-semibold text-stone-900 dark:text-white">{review.rating}</Text>
        </View>
      </View>
      {review.text ? <Text className="mt-2 text-sm leading-5 text-stone-600 dark:text-zinc-300">{review.text}</Text> : null}
      {review.photoUrls.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2">
            {review.photoUrls.map((uri, index) => (
              <Pressable key={uri + index} onPress={() => onOpenPhoto(review.photoUrls, index)}>
                <Image source={{ uri }} className="size-16 rounded-lg" contentFit="cover" />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
