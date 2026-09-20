import { Pressable, Text, TextInput, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import type { Gender } from '@/lib/app-state'

type ProfileStepProps = {
  name: string
  onNameChange: (name: string) => void
  email: string
  onEmailChange: (email: string) => void
  onSubmit: () => void
  isPending?: boolean
  /** Pass both to show the For Her / For Him toggle (the checkout sheet does; the sign-in screen doesn't). */
  gender?: Gender
  onGenderChange?: (gender: Gender) => void
  title?: string
  buttonLabel?: string
}

const INPUT_CLASS = 'w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white'
const CENTERED_TEXT = { textAlignVertical: 'center' as const }

export function ProfileStep({ name, onNameChange, email, onEmailChange, onSubmit, isPending, gender, onGenderChange, title, buttonLabel }: ProfileStepProps) {
  const { t } = useTranslation()
  const showGender = gender !== undefined && onGenderChange !== undefined

  return (
    <View>
      <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">{title ?? t('auth.createProfileTitle')}</Text>
      <TextInput value={name} onChangeText={onNameChange} placeholder={t('auth.fullNamePlaceholder')} style={CENTERED_TEXT} className={`${INPUT_CLASS} mt-8`} />
      <TextInput
        value={email}
        onChangeText={onEmailChange}
        placeholder={t('auth.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        style={CENTERED_TEXT}
        className={`${INPUT_CLASS} mt-3`}
      />

      {showGender && (
        <View className="mt-4 flex-row items-center justify-between gap-3">
          <Text className="text-sm font-medium text-stone-700 dark:text-zinc-200">{t('checkoutAuth.genderLabel')}</Text>
          <View className="flex-row rounded-lg bg-stone-100 p-0.5 dark:bg-zinc-800">
            {(['For Her', 'For Him'] as Gender[]).map((item) => (
              <Pressable key={item} onPress={() => onGenderChange(item)} className={`rounded-md px-3 py-1.5 ${gender === item ? 'bg-blue-600' : ''}`}>
                <Text className={`text-xs font-semibold ${gender === item ? 'text-white' : 'text-stone-500 dark:text-zinc-400'}`}>{t(`gender.${item}`)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <Pressable onPress={onSubmit} disabled={!name.trim() || isPending} className="mt-6 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40">
        <Text className="text-sm font-semibold text-white">{buttonLabel ?? t('common.continue')}</Text>
      </Pressable>
    </View>
  )
}
