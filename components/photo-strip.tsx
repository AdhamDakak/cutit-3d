import { Pressable, ScrollView, View } from 'react-native'
import { Image } from 'expo-image'
import { Plus, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useThemeColors } from '@/lib/theme'

/** Horizontal thumbnails with a remove badge each, plus an add tile until `max` is reached. Pairs with usePhotoPicker. */
export function PhotoStrip({ photos, max, onAdd, onRemove }: { photos: string[]; max: number; onAdd: () => void; onRemove: (index: number) => void }) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" className="mt-2">
      <View className="flex-row gap-2">
        {photos.map((uri, index) => (
          <View key={uri + index} className="relative">
            <Image source={{ uri }} className="size-20 rounded-xl" contentFit="cover" />
            <Pressable
              accessibilityLabel={t('review.removePhoto')}
              onPress={() => onRemove(index)}
              className="absolute -end-1.5 -top-1.5 size-5 items-center justify-center rounded-full bg-stone-900 dark:bg-zinc-700"
            >
              <X size={12} color="#ffffff" />
            </Pressable>
          </View>
        ))}
        {photos.length < max && (
          <Pressable
            accessibilityLabel={t('review.addPhotos')}
            onPress={onAdd}
            className="size-20 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <Plus size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </ScrollView>
  )
}
