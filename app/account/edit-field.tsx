import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { StackHeader } from '@/components/stack-header'
import { useCurrentUser, useUpdateProfile } from '@/lib/hooks'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

type EditableField = 'name' | 'email'

// Same single-line input style as components/profile-step.tsx (explicit fontSize/lineHeight, see APP_CONTEXT §7).
const INPUT_CLASS = 'w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white'
const CENTERED_TEXT = { textAlignVertical: 'center' as const, fontSize: 14, lineHeight: 18 }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(field: EditableField, value: string): string | null {
  const trimmed = value.trim()
  if (field === 'name') return trimmed.length >= 2 ? null : 'account.nameTooShort'
  return trimmed === '' || EMAIL_PATTERN.test(trimmed) ? null : 'account.emailInvalid'
}

export default function EditFieldScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { field: fieldParam } = useLocalSearchParams<{ field?: string }>()
  const field: EditableField = fieldParam === 'email' ? 'email' : 'name'
  const { data: user } = useCurrentUser()
  const { mutate: updateProfile, isPending, error } = useUpdateProfile()

  // null until the user types, so the field prefills once the user record arrives instead of freezing on ''.
  const [draft, setDraft] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const current = field === 'name' ? (user?.fullName ?? '') : (user?.email ?? '')
  const value = draft ?? current
  const validationError = validate(field, value)

  const save = async () => {
    setShowErrors(true)
    if (validationError || isPending) return
    try {
      await updateProfile(field === 'name' ? { fullName: value } : { email: value })
      router.back()
    } catch {
      // error below surfaces this; the typed value stays for a retry
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t(field === 'name' ? 'account.editNameTitle' : 'account.editEmailTitle')} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView className="flex-1" contentContainerClassName="gap-2 px-5 pt-6" keyboardShouldPersistTaps="handled">
          <Text style={startAlign} className="text-sm font-medium text-stone-700 dark:text-zinc-200">
            {t(field === 'name' ? 'profile.fullName' : 'profile.emailAddress')}
            {field === 'email' ? <Text className="font-normal text-stone-400 dark:text-zinc-500"> · {t('account.optional')}</Text> : null}
          </Text>
          <TextInput
            value={value}
            onChangeText={setDraft}
            autoFocus
            placeholder={t(field === 'name' ? 'auth.fullNamePlaceholder' : 'auth.emailPlaceholder')}
            placeholderTextColor={colors.muted}
            keyboardType={field === 'email' ? 'email-address' : 'default'}
            autoCapitalize={field === 'email' ? 'none' : 'words'}
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => void save()}
            style={CENTERED_TEXT}
            className={INPUT_CLASS}
          />
          {showErrors && validationError ? <Text style={startAlign} className="text-xs text-red-500">{t(validationError)}</Text> : null}
        </ScrollView>

        <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          {error ? <Text className="mb-2 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
          <Pressable disabled={isPending} onPress={() => void save()} className="items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-50">
            <Text className="font-semibold text-white">{t(isPending ? 'account.saving' : 'account.save')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
