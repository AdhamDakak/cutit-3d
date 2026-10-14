import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ChevronDown, ListFilter, LocateFixed, Search, SlidersHorizontal, X } from 'lucide-react-native'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useTranslation } from 'react-i18next'

import { ErrorState } from '@/components/error-state'
import { EstablishmentCard } from '@/components/establishment-card'
import { ExploreMap, type ExploreMapHandle } from '@/components/explore-map'
import { DEFAULT_EXPLORE_FILTERS, ExploreFiltersSheet, type ExploreFiltersDraft } from '@/components/explore-filters-sheet'
import { SkeletonCard } from '@/components/skeleton-card'
import { StylistCard } from '@/components/stylist-card'
import type { MapBounds } from '@/lib/api'
import { useAppState } from '@/lib/app-state'
import type { Stylist, Venue } from '@/lib/data'
import { useContentGender, useStylists, useVenues } from '@/lib/hooks'
import { useUserLocation } from '@/lib/location'
import { useThemeColors } from '@/lib/theme'

const SNAP_POINTS = ['14%', '50%', '92%']
const INITIAL_SNAP_INDEX = 1
const SNAP_FRACTIONS = SNAP_POINTS.map((point) => parseFloat(point) / 100)
const SEARCH_DEBOUNCE_MS = 300
const TIME_WINDOWS = ['any', 'morning', 'afternoon', 'evening'] as const
type TimeWindow = (typeof TIME_WINDOWS)[number]

function buildDayPills(locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' })
  const today = new Date()
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + 2 + i)
    return formatter.format(date)
  })
}

/** Debounces a fast-changing value, e.g. keystrokes, before it's used as a fetch dependency. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])
  return debounced
}

/** Owns every Explore filter/search control's state, scoped to this screen only. */
function useExploreFilters() {
  const contentGender = useContentGender()
  const [searchInput, setSearchInput] = useState('')
  const debouncedQuery = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  // The Men / Women chip starts on the content gender; the filter sheet can switch it for this search.
  const [draft, setDraft] = useState<ExploreFiltersDraft>({ ...DEFAULT_EXPLORE_FILTERS, gender: contentGender })
  // This tab stays mounted, so follow a profile-gender change (or the guest toggle) by resetting the chip to it.
  useEffect(() => {
    setDraft((prev) => ({ ...prev, gender: contentGender }))
  }, [contentGender])
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('any')
  const [day, setDay] = useState<string | null>(null)

  const activeCount =
    draft.categories.length +
    (draft.priceMax != null ? 1 : 0) +
    (draft.minRating != null ? 1 : 0) +
    (draft.maxDistanceKm != null ? 1 : 0) +
    (draft.openNow ? 1 : 0)

  // "Reset" goes back to the defaults, including the content gender's chip.
  const resetDraft = () => setDraft({ ...DEFAULT_EXPLORE_FILTERS, gender: contentGender })

  return { searchInput, setSearchInput, debouncedQuery, draft, setDraft, resetDraft, timeWindow, setTimeWindow, day, setDay, activeCount }
}

function TimeWindowModal({
  visible,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean
  value: TimeWindow
  onClose: () => void
  onSelect: (value: TimeWindow) => void
}) {
  const { t } = useTranslation()
  const labels: Record<TimeWindow, string> = {
    any: t('explore.anytimeOption'),
    morning: t('venue.periodMorning'),
    afternoon: t('venue.periodAfternoon'),
    evening: t('venue.periodEvening'),
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-8" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} className="w-full max-w-xs rounded-2xl bg-white p-4 dark:bg-zinc-900">
          <Text className="mb-3 px-1 font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('explore.timeWindowTitle')}</Text>
          {TIME_WINDOWS.map((window) => {
            const active = value === window
            return (
              <Pressable
                key={window}
                onPress={() => {
                  onSelect(window)
                  onClose()
                }}
                className={`rounded-xl px-3 py-3 ${active ? 'bg-stone-100 dark:bg-zinc-800' : ''}`}
              >
                <Text className={`text-sm ${active ? 'font-semibold text-stone-900 dark:text-white' : 'text-stone-600 dark:text-zinc-300'}`}>
                  {labels[window]}
                </Text>
              </Pressable>
            )
          })}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default function ExploreScreen() {
  const { t, i18n } = useTranslation()
  const colors = useThemeColors()
  const router = useRouter()
  const dayPills = useMemo(
    () => [t('explore.dayAnyDay'), t('explore.dayToday'), t('explore.dayTomorrow'), ...buildDayPills(i18n.language)],
    [t, i18n.language],
  )
  const { theme } = useAppState()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const mapRef = useRef<ExploreMapHandle>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<'Venues' | 'Professionals'>('Venues')
  const [selectedDay, setSelectedDay] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [timeWindowOpen, setTimeWindowOpen] = useState(false)
  // Only set by "Search this area" — until then the list isn't limited to the map view (a first view centred on a
  // user far from Cairo would otherwise show an empty list).
  const [searchBounds, setSearchBounds] = useState<MapBounds | null>(null)
  const [containerHeight, setContainerHeight] = useState(0)
  const [chromeHeight, setChromeHeight] = useState(0)
  const [sheetIndex, setSheetIndex] = useState(INITIAL_SNAP_INDEX)
  const userLocation = useUserLocation({ prompt: true })
  const mapInsets = { top: chromeHeight, bottom: containerHeight * (SNAP_FRACTIONS[sheetIndex] ?? 0) }

  // Switching Venues <-> Professionals swaps the whole list underneath the
  // sheet — reset to the 50% snap point so the new list isn't left collapsed
  // (or covering the map) at whatever position the previous list was at.
  const handleModeChange = (next: 'Venues' | 'Professionals') => {
    setMode(next)
    bottomSheetRef.current?.snapToIndex(1)
  }

  const { searchInput, setSearchInput, debouncedQuery, draft, setDraft, resetDraft, timeWindow, setTimeWindow, activeCount } = useExploreFilters()

  const venueFilters = useMemo(
    () => ({
      query: debouncedQuery,
      gender: draft.gender,
      categories: draft.categories,
      priceMax: draft.priceMax ?? undefined,
      minRating: draft.minRating ?? undefined,
      maxDistanceKm: draft.maxDistanceKm ?? undefined,
      openNow: draft.openNow,
      day: dayPills[selectedDay],
      // Denied/unknown → undefined, and listVenues falls back to its mock origin for the distance filter.
      location: userLocation ?? undefined,
      bounds: searchBounds ?? undefined,
    }),
    [debouncedQuery, draft, dayPills, selectedDay, userLocation, searchBounds],
  )

  const { data: venuesData, isLoading: venuesLoading, error: venuesError, refetch: refetchVenues } = useVenues(venueFilters)
  const venues = venuesData ?? []

  const searchThisArea = async () => {
    const bounds = await mapRef.current?.getVisibleBounds().catch(() => null)
    const unchanged =
      bounds && searchBounds && (['north', 'south', 'east', 'west'] as const).every((edge) => bounds[edge] === searchBounds[edge])
    // No map bounds (web) or the same area again: a plain refetch, as before.
    if (!bounds || unchanged) refetchVenues()
    else setSearchBounds(bounds)
  }

  const resetFilters = () => {
    resetDraft()
    setSearchBounds(null)
  }

  // Stylists only take gender + rating from the shared filter set (see the
  // component-level note on why price/distance/openNow/category don't apply
  // to Cutit Go professionals in this mock).
  const { data: stylistsData, isLoading: stylistsLoading, error: stylistsError, refetch: refetchStylists } = useStylists({
    gender: draft.gender,
    minRating: draft.minRating ?? undefined,
  })
  const filteredStylists = useMemo(() => {
    const list = stylistsData ?? []
    if (!debouncedQuery.trim()) return list
    const q = debouncedQuery.trim().toLowerCase()
    return list.filter((stylist) => `${stylist.name} ${stylist.specialties.join(' ')}`.toLowerCase().includes(q))
  }, [stylistsData, debouncedQuery])

  const renderVenueItem = useCallback(
    ({ item }: { item: Venue }) => (
      <View className="px-5 pb-3">
        <EstablishmentCard
          establishment={item}
          onPress={() => {
            // Highlight and centre its pin, so the map shows where it is when the user comes back from its page.
            setSelectedId(item.id)
            mapRef.current?.centerOn(item)
            router.push(`/venue/${item.id}`)
          }}
        />
      </View>
    ),
    [router],
  )

  const renderStylistItem = useCallback(
    ({ item }: { item: Stylist }) => (
      <View className="px-5 pb-3">
        <StylistCard stylist={item} onPress={() => router.push({ pathname: '/stylist/[id]', params: { id: item.id } })} />
      </View>
    ),
    [router],
  )

  const pillClass = (active: boolean) =>
    `rounded-full border px-3.5 py-2 ${
      active
        ? 'border-stone-900 bg-stone-900 dark:border-blue-500 dark:bg-blue-600'
        : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
    }`
  const pillTextClass = (active: boolean) => `text-xs font-medium ${active ? 'text-white' : 'text-stone-600 dark:text-zinc-300'}`

  const countLabel =
    mode === 'Venues' ? t('explore.venuesInMapArea', { count: venues.length }) : t('explore.professionalsInArea', { count: filteredStylists.length })

  return (
    <View className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" onLayout={(event) => setContainerHeight(event.nativeEvent.layout.height)}>
      <ExploreMap
        ref={mapRef}
        establishments={mode === 'Venues' ? venues : []}
        selectedId={selectedId}
        onSelectPin={(item) => setSelectedId(item.id)}
        userLocation={userLocation}
        insets={mapInsets}
        dark={theme === 'dark'}
      />

      <SafeAreaView
        edges={['top']}
        className="absolute inset-x-0 top-0 bg-[#f7f5f1] dark:bg-zinc-950"
        style={{ zIndex: 10, elevation: 10 }}
        onLayout={(event) => setChromeHeight(event.nativeEvent.layout.height)}
      >
        <View className="gap-3 px-5 pb-3 pt-3">
          <View className="flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900">
              <Search size={18} color={colors.muted} />
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder={t('home.searchPlaceholder')}
                placeholderTextColor={colors.muted}
                textAlignVertical="center"
                style={{ fontSize: 14, lineHeight: 18 }}
                className="min-w-0 flex-1 text-sm text-stone-900 dark:text-white"
              />
              {searchInput.length > 0 && (
                <Pressable accessibilityLabel={t('home.clearSearch')} onPress={() => setSearchInput('')}>
                  <X size={16} color={colors.muted} />
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => setFiltersOpen(true)}
              accessibilityLabel={t('explore.viewFilters')}
              className="relative size-11 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            >
              <ListFilter size={18} color={colors.mutedStrong} />
              {activeCount > 0 && (
                <View className="absolute -end-1 -top-1 min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 py-0.5">
                  <Text className="text-[10px] font-bold text-white">{activeCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-2">
              {(['Venues', 'Professionals'] as const).map((item) => (
                <Pressable key={item} onPress={() => handleModeChange(item)} className={pillClass(mode === item)}>
                  <Text className={pillTextClass(mode === item)}>{item === 'Venues' ? t('explore.modeVenues') : t('explore.modeProfessionals')}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setTimeWindowOpen(true)}
                className="flex-row items-center gap-1 rounded-full border border-stone-200 bg-white px-3.5 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <Text className="text-xs font-medium text-stone-600 dark:text-zinc-300">
                  {timeWindow === 'any'
                    ? t('explore.anytime')
                    : timeWindow === 'morning'
                      ? t('venue.periodMorning')
                      : timeWindow === 'afternoon'
                        ? t('venue.periodAfternoon')
                        : t('venue.periodEvening')}
                </Text>
                <ChevronDown size={12} color={colors.muted} />
              </Pressable>
              <Pressable
                onPress={() => setFiltersOpen(true)}
                accessibilityLabel={t('explore.moreFilters')}
                className="relative size-8 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
              >
                <SlidersHorizontal size={14} color={colors.mutedStrong} />
                {activeCount > 0 && <View className="absolute -end-0.5 -top-0.5 size-2 rounded-full bg-blue-600" />}
              </Pressable>
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-2">
              {dayPills.map((label, index) => (
                <Pressable key={label} onPress={() => setSelectedDay(index)} className={pillClass(selectedDay === index)}>
                  <Text className={pillTextClass(selectedDay === index)}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      {userLocation ? (
        <Pressable
          onPress={() => mapRef.current?.centerOnUser()}
          accessibilityLabel={t('explore.showMyLocation')}
          className="absolute end-5 size-11 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          style={{ top: chromeHeight + 12 }}
        >
          <LocateFixed size={18} color={colors.accent} />
        </Pressable>
      ) : null}

      <BottomSheet
        ref={bottomSheetRef}
        index={INITIAL_SNAP_INDEX}
        onChange={(index) => {
          if (index >= 0) setSheetIndex(index)
        }}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <View className="flex-row items-center justify-between gap-3 px-5 pb-3">
          <Text numberOfLines={1} className="shrink font-serif text-lg font-semibold text-stone-900 dark:text-white">
            {countLabel}
          </Text>
          {mode === 'Venues' && (
            <Pressable onPress={() => void searchThisArea()}>
              <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">{t('explore.searchThisArea')}</Text>
            </Pressable>
          )}
        </View>
        {mode === 'Venues' ? (
          <BottomSheetFlatList
            data={venues}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderVenueItem}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={
              venuesLoading ? (
                <View className="gap-4 px-5">
                  <SkeletonCard />
                  <SkeletonCard />
                </View>
              ) : venuesError ? (
                <ErrorState onRetry={refetchVenues} />
              ) : (
                <View className="items-center gap-3 px-8 py-10">
                  <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('explore.emptyBodyVenues')}</Text>
                  <Pressable onPress={resetFilters} className="rounded-xl bg-stone-900 px-4 py-2.5 dark:bg-blue-600">
                    <Text className="text-xs font-semibold text-white">{t('explore.resetFilters')}</Text>
                  </Pressable>
                </View>
              )
            }
          />
        ) : (
          <BottomSheetFlatList
            data={filteredStylists}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderStylistItem}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={
              stylistsLoading ? (
                <View className="gap-4 px-5">
                  <SkeletonCard />
                  <SkeletonCard />
                </View>
              ) : stylistsError ? (
                <ErrorState onRetry={refetchStylists} />
              ) : (
                <View className="items-center gap-3 px-8 py-10">
                  <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('explore.emptyBodyProfessionals')}</Text>
                  <Pressable onPress={resetDraft} className="rounded-xl bg-stone-900 px-4 py-2.5 dark:bg-blue-600">
                    <Text className="text-xs font-semibold text-white">{t('explore.resetFilters')}</Text>
                  </Pressable>
                </View>
              )
            }
          />
        )}
      </BottomSheet>

      <ExploreFiltersSheet
        visible={filtersOpen}
        initial={draft}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setDraft(next)
          setFiltersOpen(false)
        }}
        onReset={() => {
          resetDraft()
          setFiltersOpen(false)
        }}
      />

      <TimeWindowModal visible={timeWindowOpen} value={timeWindow} onClose={() => setTimeWindowOpen(false)} onSelect={setTimeWindow} />
    </View>
  )
}
