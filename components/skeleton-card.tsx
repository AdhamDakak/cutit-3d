import { View } from 'react-native'

export function SkeletonCard() {
  return (
    <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <View className="h-36 bg-stone-200 dark:bg-zinc-800" />
      <View className="gap-3 p-3">
        <View className="h-4 w-3/5 rounded bg-stone-200 dark:bg-zinc-800" />
        <View className="h-3 w-2/5 rounded bg-stone-100 dark:bg-zinc-800" />
        <View className="flex-row gap-1">
          <View className="h-5 w-16 rounded-full bg-stone-100 dark:bg-zinc-800" />
          <View className="h-5 w-20 rounded-full bg-stone-100 dark:bg-zinc-800" />
        </View>
        <View className="h-8 rounded-lg bg-stone-100 dark:bg-zinc-800" />
      </View>
    </View>
  )
}
