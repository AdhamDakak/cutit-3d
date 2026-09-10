import { Text, View } from 'react-native'

export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const textSize = size === 'lg' ? 'text-3xl' : 'text-xl'
  return (
    <View className="flex-row items-baseline">
      <Text className={`font-serif ${textSize} font-semibold tracking-tight text-stone-900 dark:text-white`}>
        cut<Text className="text-blue-600 dark:text-blue-400">it</Text>
      </Text>
    </View>
  )
}
