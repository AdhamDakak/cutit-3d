import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { ErrorState } from '@/components/error-state'
import { StylistCard } from '@/components/stylist-card'
import type { StylistServiceType } from '@/lib/data'
import { useContentGender, useStylists } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'


export default function BookingFlowScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const contentGender = useContentGender()
  const { type } = useLocalSearchParams<{ type: StylistServiceType }>()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  // No toggle: stylists follow the content gender (profile, or Home's guest toggle) — only those who serve it
  // (lib/api's professionalServesGender). Read straight from the hook, so a profile change is reflected the next time this list renders.

  const isEvents = type === 'events-bridal'
  // Same gender-aware title as this category's card on the Cutit Go tab.
  const title = isEvents ? t('cutitGo.eventsTitle', { context: contentGender }) : t('cutitGo.atHomeTitle')
  const subtitle = isEvents ? t('eventsBridal.subtitle') : t('atHome.subtitle')
  const { data: matchingStylists, isLoading, error, refetch } = useStylists({ type: isEvents ? 'events-bridal' : 'at-home', gender: contentGender })

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
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{title}</Text>
        <View className="size-9" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
        </View>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-10 pt-4">
          <Text className="text-sm text-stone-500 dark:text-zinc-400">{subtitle}</Text>

          {!matchingStylists || matchingStylists.length === 0 ? (
            <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('bookingFlow.noStylists')}</Text>
          ) : (
            matchingStylists.map((stylist) => (
              <StylistCard
                key={stylist.id}
                stylist={stylist}
                onPress={() => router.push({ pathname: '/stylist/[id]', params: { id: stylist.id, type } })}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
