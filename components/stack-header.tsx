import type { ReactNode } from 'react'
import { I18nManager, Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useThemeColors } from '@/lib/theme'

const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

/**
 * The card-push header shared by reschedule.tsx and the account/support/legal screens: back arrow, centered title, and
 * a spacer — or an optional `action` on the end side, in which case both side slots widen equally so the title stays
 * centered.
 */
export function StackHeader({ title, action }: { title: string; action?: ReactNode }) {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  return (
    <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <View className={action ? 'w-28 items-start' : undefined}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <BackIcon size={18} color={colors.foreground} />
        </Pressable>
      </View>
      <Text numberOfLines={1} className="flex-1 px-2 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">
        {title}
      </Text>
      {action ? <View className="w-28 items-end">{action}</View> : <View className="size-9" />}
    </View>
  )
}
