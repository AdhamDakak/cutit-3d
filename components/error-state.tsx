import { Pressable, Text, View } from 'react-native'
import { AlertCircle } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <View className="size-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
        <AlertCircle size={28} color="#ef4444" />
      </View>
      <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('common.somethingWentWrong')}</Text>
      <Pressable onPress={onRetry} className="rounded-xl bg-stone-900 px-5 py-3 dark:bg-blue-600">
        <Text className="text-sm font-semibold text-white">{t('common.retry')}</Text>
      </Pressable>
    </View>
  )
}
