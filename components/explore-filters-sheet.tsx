import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { VenueCategory, VenueGender } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

export type ExploreFiltersDraft = {
  categories: VenueCategory[]
  gender: VenueGender | null
  priceMax: number | null
  minRating: number | null
  maxDistanceKm: number | null
  openNow: boolean
}

export const DEFAULT_EXPLORE_FILTERS: ExploreFiltersDraft = {
  categories: [],
  gender: null,
  priceMax: null,
  minRating: null,
  maxDistanceKm: null,
  openNow: false,
}

const CATEGORIES: VenueCategory[] = ['Barbershop', 'Beauty Salon']
const GENDERS: VenueGender[] = ['Men', 'Women', 'Unisex']
const PRICE_STEPS = [200, 400, 800]
const RATING_STEPS = [3.5, 4, 4.5]
const DISTANCE_STEPS_KM = [2, 5, 10]

type ExploreFiltersSheetProps = {
  visible: boolean
  initial: ExploreFiltersDraft
  onClose: () => void
  onApply: (draft: ExploreFiltersDraft) => void
  onReset: () => void
}

export function ExploreFiltersSheet({ visible, initial, onClose, onApply, onReset }: ExploreFiltersSheetProps) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const [draft, setDraft] = useState(initial)

  // Re-seed the draft from whatever's currently active each time the sheet opens.
  useEffect(() => {
    if (visible) setDraft(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const toggleCategory = (category: VenueCategory) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(category) ? prev.categories.filter((item) => item !== category) : [...prev.categories, category],
    }))
  }

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-2 ${
      active ? 'border-stone-900 bg-stone-900 dark:border-blue-500 dark:bg-blue-600' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
    }`
  const chipTextClass = (active: boolean) => `text-xs font-medium ${active ? 'text-white' : 'text-stone-600 dark:text-zinc-300'}`

  const handleReset = () => {
    setDraft(DEFAULT_EXPLORE_FILTERS)
    onReset()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[85%] rounded-t-3xl bg-[#f7f5f1] dark:bg-zinc-950">
          <View className="flex-row items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
            <Text className="font-serif text-xl font-semibold text-stone-900 dark:text-white">{t('exploreFilters.title')}</Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel={t('common.close')}
              className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <X size={18} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-6 px-5 py-6">
            <View className="gap-3">
              <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('exploreFilters.categoryLabel')}</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Pressable key={category} onPress={() => toggleCategory(category)} className={chipClass(draft.categories.includes(category))}>
                    <Text className={chipTextClass(draft.categories.includes(category))}>{category}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-3">
              <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('exploreFilters.genderLabel')}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable onPress={() => setDraft((prev) => ({ ...prev, gender: null }))} className={chipClass(draft.gender === null)}>
                  <Text className={chipTextClass(draft.gender === null)}>{t('exploreFilters.genderAny')}</Text>
                </Pressable>
                {GENDERS.map((gender) => (
                  <Pressable key={gender} onPress={() => setDraft((prev) => ({ ...prev, gender }))} className={chipClass(draft.gender === gender)}>
                    <Text className={chipTextClass(draft.gender === gender)}>{t(`exploreFilters.gender${gender}`)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-3">
              <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('exploreFilters.priceLabel')}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable onPress={() => setDraft((prev) => ({ ...prev, priceMax: null }))} className={chipClass(draft.priceMax === null)}>
                  <Text className={chipTextClass(draft.priceMax === null)}>{t('exploreFilters.priceAny')}</Text>
                </Pressable>
                {PRICE_STEPS.map((price) => (
                  <Pressable key={price} onPress={() => setDraft((prev) => ({ ...prev, priceMax: price }))} className={chipClass(draft.priceMax === price)}>
                    <Text className={chipTextClass(draft.priceMax === price)}>{t('exploreFilters.priceUpTo', { price })}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-3">
              <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('exploreFilters.ratingLabel')}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable onPress={() => setDraft((prev) => ({ ...prev, minRating: null }))} className={chipClass(draft.minRating === null)}>
                  <Text className={chipTextClass(draft.minRating === null)}>{t('exploreFilters.ratingAny')}</Text>
                </Pressable>
                {RATING_STEPS.map((rating) => (
                  <Pressable
                    key={rating}
                    onPress={() => setDraft((prev) => ({ ...prev, minRating: rating }))}
                    className={chipClass(draft.minRating === rating)}
                  >
                    <Text className={chipTextClass(draft.minRating === rating)}>{rating}+</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-3">
              <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('exploreFilters.distanceLabel')}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable onPress={() => setDraft((prev) => ({ ...prev, maxDistanceKm: null }))} className={chipClass(draft.maxDistanceKm === null)}>
                  <Text className={chipTextClass(draft.maxDistanceKm === null)}>{t('exploreFilters.distanceAny')}</Text>
                </Pressable>
                {DISTANCE_STEPS_KM.map((km) => (
                  <Pressable
                    key={km}
                    onPress={() => setDraft((prev) => ({ ...prev, maxDistanceKm: km }))}
                    className={chipClass(draft.maxDistanceKm === km)}
                  >
                    <Text className={chipTextClass(draft.maxDistanceKm === km)}>{t('exploreFilters.distanceUpTo', { km })}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => setDraft((prev) => ({ ...prev, openNow: !prev.openNow }))}
              className="flex-row items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('exploreFilters.openNowLabel')}</Text>
              <View className={`h-6 w-11 justify-center rounded-full px-1 ${draft.openNow ? 'bg-blue-600' : 'bg-stone-200 dark:bg-zinc-700'}`}>
                <View className={`size-4 rounded-full bg-white shadow ${draft.openNow ? 'ml-auto' : ''}`} />
              </View>
            </Pressable>
          </ScrollView>

          <View className="flex-row gap-3 border-t border-stone-200 px-5 py-4 dark:border-zinc-800">
            <Pressable onPress={handleReset} className="flex-1 items-center rounded-xl border border-stone-200 py-3.5 dark:border-zinc-700">
              <Text className="text-sm font-semibold text-stone-700 dark:text-zinc-200">{t('exploreFilters.reset')}</Text>
            </Pressable>
            <Pressable onPress={() => onApply(draft)} className="flex-1 items-center rounded-xl bg-blue-600 py-3.5">
              <Text className="text-sm font-semibold text-white">{t('exploreFilters.apply')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
