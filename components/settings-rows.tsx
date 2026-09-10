import type { ComponentType } from 'react'
import { Pressable, Text, View } from 'react-native'
import { ChevronRight, type LucideProps } from 'lucide-react-native'

import { useThemeColors } from '@/lib/theme'

type IconType = ComponentType<LucideProps>

export function SettingRow({ icon: Icon, label, value, onPress }: { icon: IconType; label: string; value?: string; onPress?: () => void }) {
  const colors = useThemeColors()
  return (
    <Pressable onPress={onPress} className="min-h-14 flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
      <View className="size-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800">
        <Icon size={16} color={colors.mutedStrong} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium text-stone-900 dark:text-white">{label}</Text>
        {value && (
          <Text numberOfLines={1} className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
            {value}
          </Text>
        )}
      </View>
      <ChevronRight size={16} color={colors.muted} />
    </Pressable>
  )
}

export function ToggleRow({ icon: Icon, label, checked, onChange }: { icon: IconType; label: string; checked: boolean; onChange: () => void }) {
  const colors = useThemeColors()
  return (
    <Pressable onPress={onChange} className="min-h-14 flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
      <View className="size-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800">
        <Icon size={16} color={colors.mutedStrong} />
      </View>
      <Text className="flex-1 text-sm font-medium text-stone-900 dark:text-white">{label}</Text>
      <View className={`h-6 w-11 justify-center rounded-full px-1 ${checked ? 'bg-blue-600' : 'bg-stone-200 dark:bg-zinc-700'}`}>
        <View className={`size-4 rounded-full bg-white shadow ${checked ? 'ml-auto' : ''}`} />
      </View>
    </Pressable>
  )
}
