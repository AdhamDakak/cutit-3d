import { useState } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { COUNTRY_CODES, type CountryCode } from '@/components/country-code-picker'
import { OtpStep } from '@/components/otp-step'
import { PhoneStep } from '@/components/phone-step'
import { ProfileStep } from '@/components/profile-step'
import { useAppState, type Gender } from '@/lib/app-state'
import { useCompleteProfile, useRequestOtp, useVerifyOtp } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

type Step = 'phone' | 'otp' | 'profile'
const STEP_INDEX: Record<Step, number> = { phone: 1, otp: 2, profile: 3 }

type CheckoutAuthSheetProps = {
  visible: boolean
  /** Dismissed without finishing — the caller keeps its selections and creates nothing. */
  onClose: () => void
  /** Account created and session signed in — the caller continues its own Confirm. */
  onAuthenticated: () => void
}

/**
 * In-flow phone → OTP → profile sign-up, presented over the venue/review
 * screen so the booking draft underneath is never unmounted. Composes the
 * same three step components app/auth.tsx uses.
 */
export function CheckoutAuthSheet({ visible, onClose, onAuthenticated }: CheckoutAuthSheetProps) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const { activeGender } = useAppState()

  const [step, setStep] = useState<Step>('phone')
  const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState<Gender>(activeGender)

  const requestOtp = useRequestOtp()
  const verifyOtp = useVerifyOtp()
  const completeProfile = useCompleteProfile()
  const error = requestOtp.error || verifyOtp.error || completeProfile.error
  const fullPhone = `${country.code} ${phone}`

  const reset = () => {
    setStep('phone')
    setPhone('')
    setName('')
    setEmail('')
    setGender(activeGender)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

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
      await completeProfile.mutate({ fullName: name, email: email || undefined, gender, phone: fullPhone })
      reset()
      onAuthenticated()
    } catch {
      // surfaced below
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[92%] rounded-t-3xl bg-[#f7f5f1] dark:bg-zinc-950">
            <View className="flex-row items-start justify-between gap-3 border-b border-stone-200 px-5 pb-4 pt-5 dark:border-zinc-800">
              <View className="min-w-0 flex-1">
                <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">
                  {t('checkoutAuth.stepIndicator', { current: STEP_INDEX[step], total: 3 })}
                </Text>
                <Text className="mt-1 font-serif text-xl font-semibold text-stone-900 dark:text-white">{t('checkoutAuth.title')}</Text>
                <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{t('checkoutAuth.subtitle')}</Text>
              </View>
              <Pressable
                onPress={handleClose}
                accessibilityLabel={t('checkoutAuth.close')}
                className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <X size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-5 pb-10 pt-6">
              {step === 'phone' && (
                <PhoneStep
                  country={country}
                  onCountryChange={setCountry}
                  phone={phone}
                  onPhoneChange={setPhone}
                  onSubmit={handlePhone}
                  isPending={requestOtp.isPending}
                  title={t('checkoutAuth.phoneTitle')}
                  subtitle={t('checkoutAuth.phoneSubtitle')}
                />
              )}
              {step === 'otp' && <OtpStep countryCode={country.code} phone={phone} onComplete={handleOtp} isPending={verifyOtp.isPending} />}
              {step === 'profile' && (
                <ProfileStep
                  name={name}
                  onNameChange={setName}
                  email={email}
                  onEmailChange={setEmail}
                  gender={gender}
                  onGenderChange={setGender}
                  onSubmit={handleProfile}
                  isPending={completeProfile.isPending}
                  title={t('checkoutAuth.profileTitle')}
                  buttonLabel={t('checkoutAuth.createAndConfirm')}
                />
              )}
              {error ? <Text className="mt-3 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
