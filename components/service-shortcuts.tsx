import { ScrollView, Text, View } from 'react-native'
import { Pressable } from 'react-native'
import { DoorOpen, Heart, Scissors, Sparkles } from 'lucide-react-native'

import { useThemeColors } from '@/lib/theme'

const actions = [
  { label: 'At Home', icon: DoorOpen },
  { label: 'Events & Bridal', icon: Sparkles },
  { label: 'Hair & Barbering', icon: Scissors },
  { label: 'Beauty & Care', icon: Heart },
]

export function ServiceShortcuts() {
  const colors = useThemeColors()
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-4">
      <View className="flex-row gap-2">
        {actions.map(({ label, icon: Icon }) => (
          <Pressable
            key={label}
            className="flex-row items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 active:opacity-80 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Icon size={16} color={colors.mutedStrong} />
            <Text className="text-xs font-medium text-stone-700 dark:text-zinc-200">{label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
