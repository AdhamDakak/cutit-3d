import { Pressable, Text, TextInput, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { GenderOptions } from '@/components/gender-options'
import type { Gender } from '@/lib/data'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

type ProfileStepProps = {
  firstName: string
  onFirstNameChange: (value: string) => void
  lastName: string
  onLastNameChange: (value: string) => void
  email: string
  onEmailChange: (email: string) => void
  /** Required: drives which salons and services the app shows. Prefilled from the guest toggle by the flow. */
  gender: Gender | null
  onGenderChange: (gender: Gender) => void
  onSubmit: () => void
  isPending?: boolean
  title?: string
  buttonLabel?: string
}

export const INPUT_CLASS = 'w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white'
export const CENTERED_TEXT = { textAlignVertical: 'center' as const, fontSize: 14, lineHeight: 18 }

/** Both names must be non-empty after trimming. Shared with app/account/edit-field.tsx. */
export function areNamesValid(firstName: string, lastName: string) {
  return firstName.trim().length > 0 && lastName.trim().length > 0
}

export function ProfileStep({
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  email,
  onEmailChange,
  gender,
  onGenderChange,
  onSubmit,
  isPending,
  title,
  buttonLabel,
}: ProfileStepProps) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const canSubmit = areNamesValid(firstName, lastName) && gender !== null && !isPending
  const label = 'mb-1.5 text-sm font-medium text-stone-700 dark:text-zinc-200'

  return (
    <View>
      <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">{title ?? t('auth.createProfileTitle')}</Text>
      <View className="mt-8 gap-3">
        <View>
          <Text style={startAlign} className={label}>
            {t('auth.firstName')}
          </Text>
          <TextInput
            value={firstName}
            onChangeText={onFirstNameChange}
            placeholder={t('auth.firstNamePlaceholder')}
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            autoComplete="given-name"
            textContentType="givenName"
            style={CENTERED_TEXT}
            className={INPUT_CLASS}
          />
        </View>
        <View>
          <Text style={startAlign} className={label}>
            {t('auth.lastName')}
          </Text>
          <TextInput
            value={lastName}
            onChangeText={onLastNameChange}
            placeholder={t('auth.lastNamePlaceholder')}
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            autoComplete="family-name"
            textContentType="familyName"
            style={CENTERED_TEXT}
            className={INPUT_CLASS}
          />
        </View>
        <TextInput
          value={email}
          onChangeText={onEmailChange}
          placeholder={t('auth.emailPlaceholder')}
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={CENTERED_TEXT}
          className={INPUT_CLASS}
        />
      </View>

      <View className="mt-5">
        <GenderOptions value={gender} onChange={onGenderChange} />
      </View>

      <Pressable onPress={onSubmit} disabled={!canSubmit} className="mt-6 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40">
        <Text className="text-sm font-semibold text-white">{buttonLabel ?? t('common.continue')}</Text>
      </Pressable>
    </View>
  )
}
