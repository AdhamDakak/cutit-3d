import { I18nManager, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { SettingRow } from '@/components/settings-rows'
import { useThemeColors } from '@/lib/theme'

export default function HelpScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.close')}
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <BackIcon size={18} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('help.title')}</Text>
        <View className="size-9" />
      </View>

      <View className="gap-3 px-5 py-6">
        <Pressable
          onPress={() => console.log('Reschedule Booking pressed')}
          className="items-center rounded-xl bg-stone-900 py-2.5 dark:bg-blue-600"
        >
          <Text className="text-xs font-semibold text-white">{t('help.rescheduleBooking')}</Text>
        </Pressable>

        <Pressable
          onPress={() => console.log('Cancel Booking pressed')}
          className="items-center rounded-xl border border-stone-200 py-2.5 dark:border-zinc-700"
        >
          <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{t('help.cancelBooking')}</Text>
        </Pressable>

        <View className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <SettingRow
            icon={MessageCircle}
            label={t('help.chatSupport')}
            value={t('help.chatWithTeam')}
            onPress={() => router.push('/chat-support')}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}
