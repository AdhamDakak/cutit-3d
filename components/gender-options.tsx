import { Pressable, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import type { Gender } from '@/lib/data'
import { startAlign } from '@/lib/rtl'

const OPTIONS: Gender[] = ['male', 'female']

/** Two large Male / Female options with the "Gender" label and why we ask. Used by sign-up and Edit gender. */
export function GenderOptions({ value, onChange }: { value: Gender | null; onChange: (gender: Gender) => void }) {
  const { t } = useTranslation()
  return (
    <View accessibilityRole="radiogroup">
      <Text style={startAlign} className="text-sm font-medium text-stone-700 dark:text-zinc-200">
        {t('auth.gender')}
      </Text>
      <View className="mt-2 flex-row gap-3">
        {OPTIONS.map((option) => {
          const selected = value === option
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(option)}
              className={`min-h-14 flex-1 items-center justify-center rounded-xl border-2 ${
                selected ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
              }`}
            >
              <Text className={`text-base font-semibold ${selected ? 'text-blue-700 dark:text-blue-300' : 'text-stone-800 dark:text-zinc-200'}`}>
                {t(`auth.${option}`)}
              </Text>
            </Pressable>
          )
        })}
      </View>
      <Text style={startAlign} className="mt-2 text-xs leading-5 text-stone-500 dark:text-zinc-400">
        {t('auth.genderHint')}
      </Text>
    </View>
  )
}
