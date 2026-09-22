import { useEffect, useState } from 'react'
import { I18nManager, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import Slider from '@react-native-community/slider'
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
const RATING_STEPS = [3.5, 4, 4.5]
const DISTANCE_STEPS_KM = [2, 5, 10]

const PRICE_MIN = 0
const PRICE_MAX = 5000
const PRICE_STEP = 50
/** Rough width (px) of the value label, for centering it over the thumb without a second layout pass, and for clamping it inside the track at both ends. */
const PRICE_LABEL_WIDTH = 84

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
  const [priceTrackWidth, setPriceTrackWidth] = useState(0)

  // The slider always shows a concrete number — "no cap" is represented as
  // the thumb sitting at the top of the range, matching the common
  // "$X+" convention, rather than needing a separate null state on the track.
  const priceValue = draft.priceMax ?? PRICE_MAX
  const priceLabel = draft.priceMax == null ? t('exploreFilters.priceAny') : t('exploreFilters.priceUpTo', { price: draft.priceMax })
  const priceRatio = (priceValue - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)
  // Centered on the thumb, but clamped so the label's own width never pushes
  // it past either edge of the track — otherwise it runs off-screen right
  // at the two values (0 and 5000) people are most likely to drag to.
  const priceLabelMaxOffset = Math.max(priceTrackWidth - PRICE_LABEL_WIDTH, 0)
  const priceLabelOffset = Math.min(Math.max(priceRatio * priceTrackWidth - PRICE_LABEL_WIDTH / 2, 0), priceLabelMaxOffset)

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

            <View className="gap-1">
              <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('exploreFilters.priceLabel')}</Text>
              <View
                className="mt-5"
                onLayout={(e) => setPriceTrackWidth(e.nativeEvent.layout.width)}
              >
                <View
                  className="absolute -top-6 min-w-[84px] items-center rounded-md bg-stone-900 px-2 py-1 dark:bg-blue-600"
                  style={I18nManager.isRTL ? { right: priceLabelOffset } : { left: priceLabelOffset }}
                >
                  <Text numberOfLines={1} className="text-[10px] font-semibold text-white">
                    {priceLabel}
                  </Text>
                </View>
                <Slider
                  minimumValue={PRICE_MIN}
                  maximumValue={PRICE_MAX}
                  step={PRICE_STEP}
                  value={priceValue}
                  onValueChange={(value) => setDraft((prev) => ({ ...prev, priceMax: value >= PRICE_MAX ? null : value }))}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.accent}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] text-stone-400 dark:text-zinc-500">{t('venue.priceEGP', { price: PRICE_MIN })}</Text>
                <Text className="text-[10px] text-stone-400 dark:text-zinc-500">{t('venue.priceEGP', { price: PRICE_MAX })}+</Text>
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
