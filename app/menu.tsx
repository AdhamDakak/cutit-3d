import { I18nManager, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, Clock3, Heart, HelpCircle, LogOut, Settings } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { SettingRow } from '@/components/settings-rows'
import { useAppState } from '@/lib/app-state'
import { useThemeColors } from '@/lib/theme'

export default function MenuScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { signOut } = useAppState()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  const handleSignOut = () => {
    signOut()
    router.replace('/onboarding')
  }

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
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('menu.title')}</Text>
        <View className="size-9" />
      </View>

      <View className="gap-3 px-5 py-6">
        <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <SettingRow icon={Heart} label={t('menu.favorites')} onPress={() => router.dismissTo('/favorites')} />
          <SettingRow icon={Clock3} label={t('menu.myBookings')} onPress={() => router.dismissTo('/(tabs)/bookings')} />
          <SettingRow icon={HelpCircle} label={t('menu.help')} onPress={() => router.dismissTo('/help')} />
          <SettingRow icon={Settings} label={t('menu.settings')} onPress={() => router.dismissTo('/(tabs)/profile')} />
        </View>

        <Pressable
          onPress={handleSignOut}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-zinc-700"
        >
          <LogOut size={16} color={colors.mutedStrong} />
          <Text className="text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('menu.signOut')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
