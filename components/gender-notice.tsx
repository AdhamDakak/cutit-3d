import { Text, View } from 'react-native'
import { Info } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { Gender } from '@/lib/data'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

/**
 * Shown on a venue or stylist that doesn't serve the viewer's content gender (reachable from Favorites, a past
 * booking, a notification or a shared link): its details stay visible, its booking UI is replaced by this.
 * `gender` is who the venue/stylist does serve.
 */
export function GenderNotice({ kind, gender }: { kind: 'venue' | 'stylist'; gender: Gender }) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  return (
    <View accessibilityRole="text" className="flex-row gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <Info size={18} color={colors.mutedStrong} />
      <View className="min-w-0 flex-1">
        <Text style={startAlign} className="text-sm font-semibold text-stone-900 dark:text-white">
          {t(`genderNotice.${kind}`, { context: gender })}
        </Text>
        <Text style={startAlign} className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
          {t('genderNotice.sub')}
        </Text>
      </View>
    </View>
  )
}
