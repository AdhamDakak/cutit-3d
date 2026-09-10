import { useState } from 'react'
import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'
import { LocateFixed, MapPin } from 'lucide-react-native'
import { useRouter } from 'expo-router'

import type { Establishment } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

const PATTERN_LINES = Array.from({ length: 5 }, (_, i) => i)

function MapPattern() {
  return (
    <View className="absolute inset-0 overflow-hidden opacity-30">
      {PATTERN_LINES.map((i) => (
        <View
          key={`a-${i}`}
          className="absolute h-[2px] w-[160%] bg-[#91a39c]"
          style={{ top: i * 60 - 40, left: -60, transform: [{ rotate: '25deg' }] }}
        />
      ))}
      {PATTERN_LINES.map((i) => (
        <View
          key={`b-${i}`}
          className="absolute h-[2px] w-[160%] bg-[#91a39c]"
          style={{ top: i * 60 - 40, left: -60, transform: [{ rotate: '-25deg' }] }}
        />
      ))}
    </View>
  )
}

export function ExploreMap({ establishments }: { establishments: Establishment[] }) {
  const [selectedPin, setSelectedPin] = useState<Establishment | null>(null)
  const colors = useThemeColors()
  const router = useRouter()

  return (
    <View className="relative h-80 overflow-hidden rounded-2xl border border-stone-200 bg-[#dce5df] dark:border-zinc-800 dark:bg-[#202728]">
      <MapPattern />
      {establishments.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => setSelectedPin(item)}
          accessibilityLabel={`Select ${item.name}`}
          className={`absolute size-9 items-center justify-center rounded-full border-4 border-white ${
            selectedPin?.id === item.id ? 'bg-blue-600' : 'bg-stone-900'
          }`}
          style={{ left: `${20 + ((index * 17) % 65)}%`, top: `${20 + ((index * 23) % 55)}%`, marginLeft: -18, marginTop: -18 }}
        >
          <MapPin size={16} color="#ffffff" fill="#ffffff" />
        </Pressable>
      ))}
      <Pressable className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-2">
        <Text className="text-xs font-semibold text-stone-800">Search this area</Text>
      </Pressable>
      <Pressable accessibilityLabel="My location" className="absolute bottom-3 right-3 size-9 items-center justify-center rounded-lg bg-white">
        <LocateFixed size={16} color="#292524" />
      </Pressable>
      {selectedPin && (
        <View className="absolute inset-x-3 bottom-16 flex-row items-center gap-3 rounded-xl bg-white p-2 shadow-lg dark:bg-zinc-900">
          <Image source={{ uri: selectedPin.image }} className="size-12 rounded-lg" contentFit="cover" />
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="text-xs font-semibold text-stone-900 dark:text-white">
              {selectedPin.name}
            </Text>
            <Text className="text-[10px] text-stone-500 dark:text-zinc-400">
              ★ {selectedPin.rating} · From EGP {selectedPin.price}
            </Text>
          </View>
          <Pressable onPress={() => router.push(`/venue/${selectedPin.id}`)} className="rounded-lg bg-stone-900 px-2.5 py-2">
            <Text className="text-[10px] font-semibold text-white">View Shop</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
