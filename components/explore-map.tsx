import { Pressable, Text, View } from 'react-native'
import { Star } from 'lucide-react-native'

import type { Establishment } from '@/lib/data'

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

export function ExploreMap({
  establishments,
  selectedId,
  onSelectPin,
}: {
  establishments: Establishment[]
  selectedId?: number | null
  onSelectPin?: (item: Establishment) => void
}) {
  return (
    <View className="absolute inset-0 overflow-hidden bg-[#dce5df] dark:bg-[#202728]">
      <MapPattern />
      {establishments.map((item, index) => {
        const selected = selectedId === item.id
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelectPin?.(item)}
            accessibilityLabel={`Select ${item.name}, rated ${item.rating}`}
            className={`absolute flex-row items-center gap-1 rounded-full border px-2 py-1 shadow-sm ${
              selected ? 'border-blue-600 bg-blue-600' : 'border-stone-200 bg-white'
            }`}
            style={{ left: `${18 + ((index * 17) % 65)}%`, top: `${15 + ((index * 23) % 40)}%` }}
          >
            <Star size={11} color={selected ? '#ffffff' : '#fbbf24'} fill={selected ? '#ffffff' : '#fbbf24'} />
            <Text className={`text-[11px] font-semibold ${selected ? 'text-white' : 'text-stone-900'}`}>{item.rating}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
