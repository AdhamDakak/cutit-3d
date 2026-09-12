import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { CalendarDays, ChevronRight, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react-native'

import { AppHeader } from '@/components/app-header'
import { EstablishmentCard } from '@/components/establishment-card'
import { RecommendationFeed } from '@/components/recommendation-feed'
import { ServiceShortcuts } from '@/components/service-shortcuts'
import { SkeletonCard } from '@/components/skeleton-card'
import { useAppState, type Gender } from '@/lib/app-state'
import { serviceFilters, venues } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

export default function HomeScreen() {
  const { activeGender, setActiveGender, isSignedIn } = useAppState()
  const colors = useThemeColors()
  const router = useRouter()
  const [service, setService] = useState('All services')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    return venues.filter((item) => {
      const genderKey = activeGender === 'For Her' ? 'Women' : 'Men'
      const genderMatch = item.gender === genderKey || item.gender === 'Unisex'
      const serviceMatch = service === 'All services' || item.servicesOffered.includes(service)
      const search = `${item.name} ${item.area} ${item.category} ${item.servicesOffered.join(' ')}`.toLowerCase()
      return genderMatch && serviceMatch && search.includes(query.toLowerCase())
    })
  }, [activeGender, query, service])

  const resetFilters = () => {
    setActiveGender('For Her')
    setService('All services')
    setQuery('')
  }

  const refresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1200)
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top']}>
      <AppHeader />
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <ServiceShortcuts />
        <RecommendationFeed establishments={venues} signedIn={isSignedIn} gender={activeGender} />

        <View className="px-5 pt-7">
          <Text className="text-sm font-medium text-stone-500 dark:text-zinc-400">Good afternoon, Amira</Text>
          <Text className="mt-1 font-serif text-3xl font-semibold leading-tight tracking-tight text-stone-900 dark:text-white">
            Find your next <Text className="font-normal text-stone-500 dark:text-zinc-400">signature look.</Text>
          </Text>
        </View>

        <View className="px-5 pt-5">
          <View className="flex-row rounded-xl bg-stone-200/70 p-1 dark:bg-zinc-800">
            {(['For Her', 'For Him'] as Gender[]).map((type) => (
              <Pressable
                key={type}
                onPress={() => setActiveGender(type)}
                className={`flex-1 items-center rounded-lg py-2.5 ${activeGender === type ? 'bg-white dark:bg-zinc-900' : ''}`}
              >
                <Text className={`text-sm font-medium ${activeGender === type ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-zinc-400'}`}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="px-5 pt-4">
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
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-4">
          <View className="flex-row items-center gap-2">
            {serviceFilters.map((item) => (
              <Pressable
                key={item}
                onPress={() => setService(item)}
                className={`rounded-full border px-3.5 py-2 ${
                  service === item ? 'border-stone-900 bg-stone-900 dark:border-blue-500 dark:bg-blue-600' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                }`}
              >
                <Text className={`text-xs font-medium ${service === item ? 'text-white' : 'text-stone-600 dark:text-zinc-400'}`}>{item}</Text>
              </Pressable>
            ))}
            <Pressable accessibilityLabel="Open filters" className="size-8 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <SlidersHorizontal size={14} color={colors.muted} />
            </Pressable>
          </View>
        </ScrollView>

        <View className="mx-5 flex-row items-center justify-between rounded-2xl bg-[#e7dfd3] px-4 py-3.5 dark:bg-zinc-800">
          <View className="flex-row items-center gap-3">
            <View className="size-9 items-center justify-center rounded-xl bg-white/70 dark:bg-zinc-700">
              <CalendarDays size={16} color={colors.mutedStrong} />
            </View>
            <View>
              <Text className="text-xs font-semibold text-stone-800 dark:text-white">Ready for a refresh?</Text>
              <Text className="mt-0.5 text-[11px] text-stone-600 dark:text-zinc-400">Rebook your last appointment</Text>
            </View>
          </View>
          <Pressable className="size-8 items-center justify-center rounded-full bg-stone-900 dark:bg-zinc-900">
            <ChevronRight size={16} color="#ffffff" />
          </Pressable>
        </View>

        <View className="px-5 pt-7">
          <View className="mb-4 flex-row items-end justify-between">
            <View>
              <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">Curated for you</Text>
              <Text className="mt-1 font-serif text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
                Near you <Text className="font-sans text-sm font-normal text-stone-500 dark:text-zinc-400">({filtered.length})</Text>
              </Text>
            </View>
            <Pressable onPress={refresh} className="flex-row items-center gap-1">
              <RotateCcw size={14} color={colors.mutedStrong} />
              <Text className="text-xs font-semibold text-stone-500 dark:text-zinc-400">Refresh</Text>
            </Pressable>
          </View>

          {loading ? (
            <View className="gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : filtered.length > 0 ? (
            <View className="gap-4">
              {filtered.map((establishment) => (
                <EstablishmentCard key={establishment.id} establishment={establishment} onPress={() => router.push(`/venue/${establishment.id}`)} />
              ))}
            </View>
          ) : (
            <View className="items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 dark:border-zinc-700 dark:bg-zinc-900/40">
              <View className="size-14 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
                <Search size={24} color={colors.muted} />
              </View>
              <Text className="mt-5 font-serif text-xl font-semibold text-stone-900 dark:text-white">Nothing found in Cairo</Text>
              <Text className="mt-2 max-w-xs text-center text-sm leading-6 text-stone-500 dark:text-zinc-400">
                No salons or barbershops found matching your search in Cairo.
              </Text>
              <Pressable onPress={resetFilters} className="mt-5 rounded-xl bg-stone-900 px-5 py-3 dark:bg-blue-600">
                <Text className="text-sm font-semibold text-white">Reset filters</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
