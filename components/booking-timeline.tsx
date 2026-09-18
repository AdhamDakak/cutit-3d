import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Check } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { BookingStatus } from '@/lib/data'

const STEPS: BookingStatus[] = ['pending', 'confirmed', 'completed']

type BookingTimelineProps = {
  status: BookingStatus
}

export function BookingTimeline({ status }: BookingTimelineProps) {
  const { t } = useTranslation()

  if (status === 'cancelled') {
    return (
      <View className="flex-row items-center gap-1.5 px-4 pb-3">
        <View className="size-1.5 rounded-full bg-stone-400 dark:bg-zinc-600" />
        <Text className="text-[10px] font-medium text-stone-500 dark:text-zinc-400">{t('bookings.cancelled')}</Text>
      </View>
    )
  }

  const currentIndex = STEPS.indexOf(status)

  // Built once, start→end — flex-row mirrors this automatically under RTL,
  // so "pending" always sits at the reading-start regardless of language.
  const nodes: ReactNode[] = []
  STEPS.forEach((step, index) => {
    const isDone = index < currentIndex
    const isCurrent = index === currentIndex

    nodes.push(
      <View key={`dot-${step}`} className="items-center gap-1">
        <View
          className={`size-4 items-center justify-center rounded-full ${
            isDone
              ? 'bg-emerald-500'
              : isCurrent
                ? 'bg-blue-600 dark:bg-blue-500'
                : 'border border-stone-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
          }`}
        >
          {isDone ? <Check size={10} color="#ffffff" /> : null}
        </View>
        <Text
          className={`text-[9px] font-medium ${
            isCurrent ? 'text-stone-900 dark:text-white' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-zinc-500'
          }`}
        >
          {t(`bookings.${step}`)}
        </Text>
      </View>,
    )

    if (index < STEPS.length - 1) {
      nodes.push(
        <View key={`line-${step}`} className={`mt-2 h-px flex-1 ${isDone ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-stone-200 dark:bg-zinc-700'}`} />,
      )
    }
  })

  return <View className="flex-row items-start px-4 pb-3">{nodes}</View>
}
