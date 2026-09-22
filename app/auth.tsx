import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { COUNTRY_CODES, type CountryCode } from '@/components/country-code-picker'
import { Logo } from '@/components/logo'
import { OtpStep } from '@/components/otp-step'
import { PhoneStep } from '@/components/phone-step'
import { ProfileStep } from '@/components/profile-step'
import { useAppState } from '@/lib/app-state'
import { useCompleteProfile, useRequestOtp, useVerifyOtp } from '@/lib/hooks'

type Step = 'phone' | 'otp' | 'profile'

export default function AuthScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { completeOnboarding, activeGender } = useAppState()
  const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<Step>('phone')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const requestOtp = useRequestOtp()
  const verifyOtp = useVerifyOtp()
  const completeProfile = useCompleteProfile()
  const error = requestOtp.error || verifyOtp.error || completeProfile.error
  const fullPhone = `${country.code} ${phone}`

  const handlePhone = async () => {
    try {
      await requestOtp.mutate(fullPhone)
      setStep('otp')
    } catch {
      // surfaced below
    }
  }

  const handleOtp = async (code: string) => {
    try {
      await verifyOtp.mutate(fullPhone, code)
      setStep('profile')
    } catch {
      // surfaced below
    }
  }

  const handleProfile = async () => {
    try {
      await completeProfile.mutate({ fullName: name, email: email || undefined, gender: activeGender, phone: fullPhone })
      completeOnboarding()
      router.replace('/(tabs)')
    } catch {
      // surfaced below
    }
  }

  // A guest is exactly that — not signed in. The checkout sheet creates the
  // account later, at their first Confirm.
  const continueAsGuest = () => {
    completeOnboarding()
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] px-5 dark:bg-zinc-950" edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="mx-auto w-full max-w-md flex-1 pb-28 pt-6">
          <Logo />

          <View className="mt-16">
            {step === 'phone' && (
              <PhoneStep country={country} onCountryChange={setCountry} phone={phone} onPhoneChange={setPhone} onSubmit={handlePhone} isPending={requestOtp.isPending} />
            )}
            {step === 'otp' && <OtpStep countryCode={country.code} phone={phone} onComplete={handleOtp} isPending={verifyOtp.isPending} />}
            {step === 'profile' && (
              <ProfileStep name={name} onNameChange={setName} email={email} onEmailChange={setEmail} onSubmit={handleProfile} isPending={completeProfile.isPending} />
            )}
            {error ? <Text className="mt-3 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
          </View>
        </View>

        {step !== 'profile' && (
          <Pressable onPress={continueAsGuest} className="absolute inset-x-5 bottom-10 items-center py-4">
            <Text className="text-sm font-semibold text-stone-700 underline dark:text-zinc-300">{t('common.continueAsGuest')}</Text>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
