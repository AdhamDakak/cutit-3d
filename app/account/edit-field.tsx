import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { GenderOptions } from '@/components/gender-options'
import { areNamesValid, CENTERED_TEXT, INPUT_CLASS } from '@/components/profile-step'
import { StackHeader } from '@/components/stack-header'
import type { Gender } from '@/lib/data'
import { useCurrentUser, useUpdateProfile } from '@/lib/hooks'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

type EditableField = 'name' | 'email' | 'gender'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TITLE_KEY: Record<EditableField, string> = { name: 'account.editNameTitle', email: 'account.editEmailTitle', gender: 'account.editGenderTitle' }

export default function EditFieldScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { field: fieldParam } = useLocalSearchParams<{ field?: string }>()
  const field: EditableField = fieldParam === 'email' || fieldParam === 'gender' ? fieldParam : 'name'
  const { data: user } = useCurrentUser()
  const { mutate: updateProfile, isPending, error } = useUpdateProfile()

  // Each draft is null until edited, so the fields prefill once the user record arrives instead of freezing on ''.
  const [firstDraft, setFirstDraft] = useState<string | null>(null)
  const [lastDraft, setLastDraft] = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState<string | null>(null)
  const [genderDraft, setGenderDraft] = useState<Gender | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  const firstName = firstDraft ?? user?.firstName ?? ''
  const lastName = lastDraft ?? user?.lastName ?? ''
  const email = emailDraft ?? user?.email ?? ''
  const gender = genderDraft ?? user?.gender ?? null

  const validationError =
    field === 'name'
      ? areNamesValid(firstName, lastName)
        ? null
        : 'account.namesRequired'
      : field === 'email'
        ? email.trim() === '' || EMAIL_PATTERN.test(email.trim())
          ? null
          : 'account.emailInvalid'
        : gender
          ? null
          : 'account.genderRequired'

  const save = async () => {
    setShowErrors(true)
    if (validationError || isPending) return
    try {
      await updateProfile(field === 'name' ? { firstName, lastName } : field === 'email' ? { email } : { gender: gender ?? undefined })
      router.back()
    } catch {
      // error below surfaces this; the edited value stays for a retry
    }
  }

  const label = 'mb-1.5 text-sm font-medium text-stone-700 dark:text-zinc-200'

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t(TITLE_KEY[field])} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pt-6" keyboardShouldPersistTaps="handled">
          {field === 'name' ? (
            <>
              <View>
                <Text style={startAlign} className={label}>
                  {t('auth.firstName')}
                </Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstDraft}
                  autoFocus
                  placeholder={t('auth.firstNamePlaceholder')}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
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
                  onChangeText={setLastDraft}
                  placeholder={t('auth.lastNamePlaceholder')}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  textContentType="familyName"
                  returnKeyType="done"
                  onSubmitEditing={() => void save()}
                  style={CENTERED_TEXT}
                  className={INPUT_CLASS}
                />
              </View>
            </>
          ) : field === 'email' ? (
            <View>
              <Text style={startAlign} className={label}>
                {t('profile.emailAddress')}
                <Text className="font-normal text-stone-400 dark:text-zinc-500"> · {t('account.optional')}</Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmailDraft}
                autoFocus
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => void save()}
                style={CENTERED_TEXT}
                className={INPUT_CLASS}
              />
            </View>
          ) : (
            <GenderOptions value={gender} onChange={setGenderDraft} />
          )}
          {showErrors && validationError ? (
            <Text style={startAlign} className="text-xs text-red-500">
              {t(validationError)}
            </Text>
          ) : null}
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
