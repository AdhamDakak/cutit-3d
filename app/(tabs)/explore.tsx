import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Search, X } from 'lucide-react-native'

import { AppHeader } from '@/components/app-header'
import { EstablishmentCard } from '@/components/establishment-card'
import { ExploreMap } from '@/components/explore-map'
import { useAppState } from '@/lib/app-state'
import { establishments } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

export default function ExploreScreen() {
  const { activeGender } = useAppState()
  const colors = useThemeColors()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [mapView, setMapView] = useState(true)

  const filtered = useMemo(() => {
    return establishments.filter((item) => {
      const genderKey = activeGender === 'For Her' ? 'Women' : 'Men'
      const genderMatch = item.gender === genderKey || item.gender === 'Unisex'
      const search = `${item.name} ${item.district} ${item.category} ${item.services.join(' ')}`.toLowerCase()
      return genderMatch && search.includes(query.toLowerCase())
    })
  }, [activeGender, query])

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top']}>
      <AppHeader />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 py-5 pb-10">
        <View className="flex-row items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
          <Search size={16} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search salons, services..."
            placeholderTextColor={colors.muted}
            className="min-w-0 flex-1 text-sm text-stone-900 dark:text-white"
          />
          {query.length > 0 && (
            <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}>
              <X size={16} color={colors.muted} />
            </Pressable>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="font-serif text-xl font-semibold text-stone-900 dark:text-white">Nearby in Cairo</Text>
          <View className="flex-row rounded-lg bg-stone-200 p-1 dark:bg-zinc-800">
            <Pressable onPress={() => setMapView(true)} className={`rounded px-2 py-1 ${mapView ? 'bg-white' : ''}`}>
              <Text className={`text-[10px] ${mapView ? 'text-stone-900' : 'text-stone-500 dark:text-zinc-400'}`}>Map</Text>
            </Pressable>
            <Pressable onPress={() => setMapView(false)} className={`rounded px-2 py-1 ${!mapView ? 'bg-white' : ''}`}>
              <Text className={`text-[10px] ${!mapView ? 'text-stone-900' : 'text-stone-500 dark:text-zinc-400'}`}>List</Text>
            </Pressable>
          </View>
        </View>

        {mapView ? (
          <ExploreMap establishments={filtered} />
        ) : (
          <View className="gap-3">
            {filtered.map((item) => (
              <EstablishmentCard key={item.id} establishment={item} onPress={() => router.push(`/venue/${item.id}`)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
