import { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ChevronDown, ListFilter, Search, SlidersHorizontal } from 'lucide-react-native'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'

import { EstablishmentCard } from '@/components/establishment-card'
import { ExploreMap } from '@/components/explore-map'
import { useAppState } from '@/lib/app-state'
import { venues, type Venue } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

const SNAP_POINTS = ['14%', '50%', '92%']

function buildDayPills() {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const upcoming = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + 2 + i)
    return `${dayNames[date.getDay()]} ${date.getDate()}`
  })
  return ['Any day', 'Today', 'Tomorrow', ...upcoming]
}

const DAY_PILLS = buildDayPills()

export default function ExploreScreen() {
  const { activeGender } = useAppState()
  const colors = useThemeColors()
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<'Venues' | 'Professionals'>('Venues')
  const [selectedDay, setSelectedDay] = useState(0)

  const filtered = useMemo(() => {
    return venues.filter((item) => {
      const genderKey = activeGender === 'For Her' ? 'Women' : 'Men'
      return item.gender === genderKey || item.gender === 'Unisex'
    })
  }, [activeGender])

  const renderItem = useCallback(
    ({ item }: { item: Venue }) => (
      <View className="px-5 pb-3">
        <EstablishmentCard establishment={item} onPress={() => router.push(`/venue/${item.id}`)} />
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

  return (
    <View className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950">
      <ExploreMap establishments={filtered} selectedId={selectedId} onSelectPin={(item) => setSelectedId(item.id)} />

      <SafeAreaView
        edges={['top']}
        className="absolute inset-x-0 top-0 bg-[#f7f5f1] dark:bg-zinc-950"
        style={{ zIndex: 10, elevation: 10 }}
      >
        <View className="gap-3 px-5 pb-3 pt-3">
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityLabel="Search treatments"
              className="flex-1 flex-row items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <Search size={18} color={colors.muted} />
              <View>
                <Text className="text-sm font-semibold text-stone-900 dark:text-white">All treatments</Text>
                <Text className="text-xs text-stone-500 dark:text-zinc-400">Current location</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityLabel="View filters"
              className="size-11 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            >
              <ListFilter size={18} color={colors.mutedStrong} />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-2">
              {(['Venues', 'Professionals'] as const).map((item) => (
                <Pressable key={item} onPress={() => setMode(item)} className={pillClass(mode === item)}>
                  <Text className={pillTextClass(mode === item)}>{item}</Text>
                </Pressable>
              ))}
              <Pressable className="flex-row items-center gap-1 rounded-full border border-stone-200 bg-white px-3.5 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                <Text className="text-xs font-medium text-stone-600 dark:text-zinc-300">Anytime</Text>
                <ChevronDown size={12} color={colors.muted} />
              </Pressable>
              <Pressable
                accessibilityLabel="More filters"
                className="size-8 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
              >
                <SlidersHorizontal size={14} color={colors.mutedStrong} />
              </Pressable>
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-2">
              {DAY_PILLS.map((label, index) => (
                <Pressable key={label} onPress={() => setSelectedDay(index)} className={pillClass(selectedDay === index)}>
                  <Text className={pillTextClass(selectedDay === index)}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <BottomSheet
        index={1}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <View className="px-5 pb-3">
          <Text className="font-serif text-lg font-semibold text-stone-900 dark:text-white">{filtered.length} venues in map area</Text>
        </View>
        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </BottomSheet>
    </View>
  )
}
