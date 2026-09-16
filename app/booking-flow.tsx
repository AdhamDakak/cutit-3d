import { useState } from 'react'
import { I18nManager, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { StylistCard } from '@/components/stylist-card'
import { useAppState } from '@/lib/app-state'
import { getStylistsByType, type StylistServiceType } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

type GenderFilter = 'him' | 'her'
const GENDER_FILTERS: GenderFilter[] = ['him', 'her']

export default function BookingFlowScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { activeGender } = useAppState()
  const { type } = useLocalSearchParams<{ type: StylistServiceType }>()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  // Defaults from the app-wide gender preference, but this toggle is
  // local-only from here — changing it must never write back to
  // app-state, per the task. Falls back to "him" if that preference is
  // ever anything other than exactly "For Her".
  const [genderFilter, setGenderFilter] = useState<GenderFilter>(activeGender === 'For Her' ? 'her' : 'him')

  const isEvents = type === 'events-bridal'
  const title = isEvents ? t('eventsBridal.title') : t('atHome.title')
  const subtitle = isEvents ? t('eventsBridal.subtitle') : t('atHome.subtitle')
  const servesKey = genderFilter === 'her' ? 'female' : 'male'
  const matchingStylists = getStylistsByType(isEvents ? 'events-bridal' : 'at-home').filter((stylist) =>
    stylist.servesGender.includes(servesKey),
  )

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

      <View className="px-5 pt-4">
        <View className="flex-row rounded-xl bg-stone-200/70 p-1 dark:bg-zinc-900">
          {GENDER_FILTERS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setGenderFilter(option)}
              className={`flex-1 items-center rounded-lg py-2.5 ${genderFilter === option ? 'bg-white dark:bg-zinc-800' : ''}`}
            >
              <Text
                className={`text-sm font-semibold ${genderFilter === option ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-zinc-400'}`}
              >
                {option === 'him' ? t('common.him') : t('common.her')}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-10 pt-4">
        <Text className="text-sm text-stone-500 dark:text-zinc-400">{subtitle}</Text>

        {matchingStylists.length === 0 ? (
          <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('bookingFlow.noStylists')}</Text>
        ) : (
          matchingStylists.map((stylist) => (
            <StylistCard key={stylist.id} stylist={stylist} onPress={() => router.push(`/stylist/${stylist.id}`)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
