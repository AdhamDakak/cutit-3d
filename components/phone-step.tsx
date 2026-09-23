import { Pressable, Text, TextInput, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { CountryCodePicker, type CountryCode } from '@/components/country-code-picker'

type PhoneStepProps = {
  country: CountryCode
  onCountryChange: (country: CountryCode) => void
  phone: string
  onPhoneChange: (phone: string) => void
  onSubmit: () => void
  isPending?: boolean
  /** Defaults to the sign-in screen's copy; the checkout sheet overrides these. */
  title?: string
  subtitle?: string
}

export function isPhoneComplete(phone: string) {
  return phone.replace(/\D/g, '').length >= 10
}

export function PhoneStep({ country, onCountryChange, phone, onPhoneChange, onSubmit, isPending, title, subtitle }: PhoneStepProps) {
  const { t } = useTranslation()

  return (
    <View>
      <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">{title ?? t('auth.welcomeTitle')}</Text>
      <Text className="mt-3 text-sm text-stone-500 dark:text-zinc-400">{subtitle ?? t('auth.welcomeSubtitle')}</Text>
      {/* Phone numbers read left-to-right in every locale; pin the row's direction so RTL doesn't mirror picker + digits. */}
      <View className="mt-8 flex-row items-center gap-2" style={{ direction: 'ltr' }}>
        <CountryCodePicker value={country} onChange={onCountryChange} />
        <TextInput
          value={phone}
          onChangeText={onPhoneChange}
          keyboardType="phone-pad"
          placeholder={t('auth.phonePlaceholder')}
          style={{ writingDirection: 'ltr', textAlign: 'left', textAlignVertical: 'center', fontSize: 14, lineHeight: 18 }}
          className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </View>
      <Pressable
        onPress={onSubmit}
        disabled={!isPhoneComplete(phone) || isPending}
        className="mt-4 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40"
      >
        <Text className="text-sm font-semibold text-white">{t('auth.sendOtp')}</Text>
      </Pressable>
    </View>
  )
}
