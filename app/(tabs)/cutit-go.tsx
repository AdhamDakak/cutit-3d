import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ChevronLeft, ChevronRight, DoorOpen, Sparkles } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useThemeColors } from '@/lib/theme'

export default function CutitGoScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const ForwardChevron = I18nManager.isRTL ? ChevronLeft : ChevronRight

  const options = [
    {
      key: 'at-home',
      icon: DoorOpen,
      title: t('cutitGo.atHomeTitle'),
      description: t('cutitGo.atHomeDescription'),
      onPress: () => router.push('/at-home'),
    },
    {
      key: 'events-bridal',
      icon: Sparkles,
      title: t('cutitGo.eventsTitle'),
      description: t('cutitGo.eventsDescription'),
      onPress: () => router.push('/events-bridal'),
    },
  ] as const

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pb-10 pt-5">
        <View>
          <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">{t('tabs.cutitGo')}</Text>
          <Text className="mt-1 font-serif text-2xl font-semibold text-stone-900 dark:text-white">{t('cutitGo.title')}</Text>
          <Text className="mt-1 text-sm text-stone-500 dark:text-zinc-400">{t('cutitGo.subtitle')}</Text>
        </View>

        <View className="gap-3">
          {options.map(({ key, icon: Icon, title, description, onPress }) => (
            <Pressable
              key={key}
              onPress={onPress}
              className="flex-row items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 active:opacity-90 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <View className="size-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                <Icon size={26} color={colors.accent} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="font-serif text-lg font-semibold text-stone-900 dark:text-white">{title}</Text>
                <Text className="mt-0.5 text-sm text-stone-500 dark:text-zinc-400">{description}</Text>
              </View>
              <ForwardChevron size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
