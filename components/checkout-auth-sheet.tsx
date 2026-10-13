import { useEffect } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { AccountNotFoundStep, AuthSwitchLink, WelcomeBackStep } from '@/components/auth-flow-steps'
import { OtpStep } from '@/components/otp-step'
import { PhoneStep } from '@/components/phone-step'
import { ProfileStep } from '@/components/profile-step'
import { usePhoneAuthFlow, type AuthStep } from '@/components/usePhoneAuthFlow'
import { useSheetDismissGesture } from '@/components/useSheetDismissGesture'
import { useAppState } from '@/lib/app-state'
import { tracking } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

const STEP_INDEX: Record<AuthStep, number> = { phone: 1, otp: 2, profile: 3, 'not-found': 2, 'welcome-back': 3 }

type CheckoutAuthSheetProps = {
  visible: boolean
  /** Dismissed without finishing — the caller keeps its selections and creates nothing. */
  onClose: () => void
  /** Signed in (new account or a returning one) — the caller continues its own Confirm, or just carries on. */
  onAuthenticated: () => void
  /**
   * 'checkout' (default): creating an account at Confirm, used by venue/[id].tsx and go-booking/review.tsx.
   * 'signup': standalone account creation (Home's avatar, the guest cards).
   * 'login': a returning user logging in. Every mode can switch between signing up and logging in.
   */
  mode?: 'checkout' | 'signup' | 'login'
}

const COPY_KEYS = {
  checkout: { title: 'checkoutAuth.title', subtitle: 'checkoutAuth.subtitle', phoneSubtitle: 'checkoutAuth.phoneSubtitle', button: 'checkoutAuth.createAndConfirm' },
  signup: { title: 'checkoutAuth.signupTitle', subtitle: 'checkoutAuth.signupSubtitle', phoneSubtitle: 'checkoutAuth.signupPhoneSubtitle', button: 'checkoutAuth.createAccount' },
  login: { title: 'auth.loginTitle', subtitle: 'auth.loginSubtitle', phoneSubtitle: 'checkoutAuth.signupPhoneSubtitle', button: 'checkoutAuth.createAccount' },
} as const

/**
 * In-flow phone → OTP (→ profile) sign-up or log-in, presented over the current screen so whatever is underneath (a
 * booking draft, Home) is never unmounted. Runs the same usePhoneAuthFlow as app/auth.tsx.
 */
export function CheckoutAuthSheet({ visible, onClose, onAuthenticated, mode = 'checkout' }: CheckoutAuthSheetProps) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const { activeGender } = useAppState()

  const auth = usePhoneAuthFlow({
    initialFlow: mode === 'login' ? 'login' : 'signup',
    defaultGender: activeGender,
    onAuthenticated: () => {
      auth.reset()
      onAuthenticated()
    },
  })
  // Copy follows the current flow: switching a checkout sheet to log in shows the log-in copy, and back.
  const copy = COPY_KEYS[auth.flow === 'login' ? 'login' : mode === 'login' ? 'signup' : mode]

  const handleClose = () => {
    auth.reset()
    onClose()
  }

  const { panGesture, animatedStyle } = useSheetDismissGesture(visible, handleClose)

  // The sheet stays mounted between opens (and one screen can open it as signup or login), so start each opening
  // fresh in the current `mode`.
  useEffect(() => {
    if (visible) auth.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mode])

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="flex-1 justify-end bg-black/40">
            <Animated.View style={animatedStyle}>
              <View className="max-h-[92%] rounded-t-3xl bg-[#f7f5f1] dark:bg-zinc-950">
                <GestureDetector gesture={panGesture}>
                  <View className="flex-row items-start justify-between gap-3 border-b border-stone-200 px-5 pb-4 pt-5 dark:border-zinc-800">
                    <View className="min-w-0 flex-1">
                      <Text className={`text-[11px] font-medium uppercase ${tracking('tracking-[3px]')} text-stone-500 dark:text-zinc-500`}>
                        {t('checkoutAuth.stepIndicator', { current: STEP_INDEX[auth.step], total: auth.flow === 'login' ? 2 : 3 })}
                      </Text>
                      <Text className="mt-1 font-serif text-xl font-semibold text-stone-900 dark:text-white">{t(copy.title)}</Text>
                      <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{t(copy.subtitle)}</Text>
                    </View>
                    <Pressable
                      onPress={handleClose}
                      accessibilityLabel={t('checkoutAuth.close')}
                      className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <X size={18} color={colors.foreground} />
                    </Pressable>
                  </View>
                </GestureDetector>

                <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-5 pb-10 pt-6">
                  {auth.step === 'phone' && (
                    <PhoneStep
                      country={auth.country}
                      onCountryChange={auth.setCountry}
                      phone={auth.phone}
                      onPhoneChange={auth.setPhone}
                      onSubmit={auth.submitPhone}
                      isPending={auth.isRequestingOtp}
                      title={t('checkoutAuth.phoneTitle')}
                      subtitle={t(copy.phoneSubtitle)}
                    />
                  )}
                  {auth.step === 'otp' && <OtpStep countryCode={auth.country.code} phone={auth.phone} onComplete={auth.submitOtp} isPending={auth.isVerifying} />}
                  {auth.step === 'profile' && (
                    <ProfileStep
                      name={auth.name}
                      onNameChange={auth.setName}
                      email={auth.email}
                      onEmailChange={auth.setEmail}
                      gender={auth.gender}
                      onGenderChange={auth.setGender}
                      onSubmit={auth.submitProfile}
                      isPending={auth.isCreating}
                      title={t('checkoutAuth.profileTitle')}
                      buttonLabel={t(mode === 'checkout' ? COPY_KEYS.checkout.button : COPY_KEYS.signup.button)}
                    />
                  )}
                  {auth.step === 'not-found' && <AccountNotFoundStep onCreate={auth.createInsteadOfLogin} onUseAnotherNumber={auth.startOver} />}
                  {auth.step === 'welcome-back' && (
                    <WelcomeBackStep
                      name={auth.welcomeName}
                      onContinue={() => {
                        auth.reset()
                        onAuthenticated()
                      }}
                    />
                  )}
                  {auth.error ? <Text className="mt-3 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
                  {auth.step === 'phone' || auth.step === 'otp' ? <AuthSwitchLink flow={auth.flow} onPress={auth.switchFlow} /> : null}
                </ScrollView>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  )
}
