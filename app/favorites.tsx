import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { EstablishmentCard } from '@/components/establishment-card'
import { venues } from '@/lib/data'
import { useFavorites } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

export default function FavoritesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { data: favoriteVenueIds } = useFavorites()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  const favoriteVenues = venues.filter((venue) => favoriteVenueIds?.has(venue.id))

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.close')}
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <BackIcon size={18} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('favorites.title')}</Text>
        <View className="size-9" />
      </View>

      {favoriteVenues.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <View className="size-16 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
            <Heart size={28} color={colors.muted} />
          </View>
          <View className="items-center gap-1">
            <Text className="font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('favorites.emptyTitle')}</Text>
            <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('favorites.emptyBody')}</Text>
          </View>
          <Pressable onPress={() => router.dismissTo('/(tabs)/explore')} className="mt-2 rounded-xl bg-stone-900 px-5 py-3 dark:bg-blue-600">
            <Text className="text-sm font-semibold text-white">{t('favorites.browseVenues')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 py-6">
          {favoriteVenues.map((venue) => (
            <EstablishmentCard key={venue.id} establishment={venue} onPress={() => router.push(`/venue/${venue.id}`)} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
