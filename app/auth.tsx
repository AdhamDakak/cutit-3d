import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { CountryCodePicker, COUNTRY_CODES, type CountryCode } from '@/components/country-code-picker'
import { Logo } from '@/components/logo'
import { useAppState } from '@/lib/app-state'

type Step = 'phone' | 'otp' | 'profile'

export default function AuthScreen() {
  const { t } = useTranslation()
  const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<Step>('phone')
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''))
  const [name, setName] = useState('')
  const otpRefs = useRef<Array<TextInput | null>>([])
  const autoSubmittedRef = useRef(false)
  const router = useRouter()
  const { signIn, completeOnboarding } = useAppState()

  useEffect(() => {
    const code = otpDigits.join('')
    if (code.length === 6 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true
      setStep('profile')
    }
  }, [otpDigits])

  const finish = () => {
    signIn()
    completeOnboarding()
    router.replace('/(tabs)')
  }

  const updateOtpDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
      setOtpDigits((prev) => {
        const next = [...prev]
        next[index - 1] = ''
        return next
      })
    }
  }

  const inputClass =
    'mt-8 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white'
  const centeredTextStyle = { textAlignVertical: 'center' as const }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] px-5 dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="mx-auto w-full max-w-md flex-1 pb-28 pt-6">
        <Logo />

        {step === 'phone' && (
          <View className="mt-16">
            <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">{t('auth.welcomeTitle')}</Text>
            <Text className="mt-3 text-sm text-stone-500 dark:text-zinc-400">{t('auth.welcomeSubtitle')}</Text>
            <View className="mt-8 flex-row items-center gap-2">
              <CountryCodePicker value={country} onChange={setCountry} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder={t('auth.phonePlaceholder')}
                style={{ writingDirection: 'ltr', textAlign: 'left' }}
                className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </View>
            <Pressable
              onPress={() => setStep('otp')}
              disabled={phone.replace(/\D/g, '').length < 10}
              className="mt-4 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40"
            >
              <Text className="text-sm font-semibold text-white">{t('auth.sendOtp')}</Text>
            </Pressable>
          </View>
        )}

        {step === 'otp' && (
          <View className="mt-16">
            <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">{t('auth.verifyTitle')}</Text>
            <Text className="mt-3 text-sm text-stone-500 dark:text-zinc-400">
              {t('auth.codeSentTo', { code: country.code, phone })}
            </Text>
            <View className="mt-8 flex-row justify-between gap-2">
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el
                  }}
                  value={digit}
                  onChangeText={(text) => updateOtpDigit(index, text)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={{ textAlign: 'center' }}
                  className="h-14 w-12 rounded-xl border border-stone-200 bg-white text-lg font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              ))}
            </View>
            <Text className="mt-3 text-center text-xs text-stone-500 dark:text-zinc-400">{t('auth.resendCode')}</Text>
            <Pressable
              onPress={() => setStep('profile')}
              disabled={otpDigits.some((d) => !d)}
              className="mt-6 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40"
            >
              <Text className="text-sm font-semibold text-white">{t('auth.verifyContinue')}</Text>
            </Pressable>
          </View>
        )}

        {step === 'profile' && (
          <View className="mt-16">
            <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">{t('auth.createProfileTitle')}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('auth.fullNamePlaceholder')}
              style={centeredTextStyle}
              className={inputClass}
            />
            <TextInput
              placeholder={t('auth.emailPlaceholder')}
              style={centeredTextStyle}
              className={`${inputClass} mt-3`}
            />
            <Pressable
              onPress={finish}
              disabled={!name.trim()}
              className="mt-6 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40"
            >
              <Text className="text-sm font-semibold text-white">{t('common.continue')}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {step !== 'profile' && (
        <Pressable onPress={finish} className="absolute inset-x-5 bottom-10 items-center py-4">
          <Text className="text-sm font-semibold text-stone-700 underline dark:text-zinc-300">{t('common.continueAsGuest')}</Text>
        </Pressable>
      )}
    </SafeAreaView>
  )
}
