import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { GenderStylistPicker } from '@/components/gender-stylist-picker'
import type { Gender } from '@/lib/app-state'
import { useThemeColors } from '@/lib/theme'

export default function AtHomeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  const handleSelectStylist = (staffId: string, gender: Gender) => {
    const genderParam = gender === 'For Her' ? 'her' : 'him'
    // `/booking-flow` doesn't exist yet — still needs to be built separately.
    router.push(`/booking-flow?type=at-home&gender=${genderParam}&staffId=${staffId}` as Href)
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
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('atHome.title')}</Text>
        <View className="size-9" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pb-10 pt-6">
        <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('atHome.subtitle')}</Text>
        <GenderStylistPicker onSelectStylist={handleSelectStylist} />
      </ScrollView>
    </SafeAreaView>
  )
}
