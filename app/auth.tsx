import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { AccountNotFoundStep, AuthSwitchLink, WelcomeBackStep } from '@/components/auth-flow-steps'
import { Logo } from '@/components/logo'
import { OtpStep } from '@/components/otp-step'
import { PhoneStep } from '@/components/phone-step'
import { ProfileStep } from '@/components/profile-step'
import { usePhoneAuthFlow } from '@/components/usePhoneAuthFlow'
import { useAppState } from '@/lib/app-state'

export default function AuthScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { completeOnboarding, guestGender } = useAppState()

  const finish = () => {
    completeOnboarding()
    router.replace('/(tabs)')
  }

  // Defaults to sign-up (this follows onboarding); the switch link flips to log in for returning users.
  const auth = usePhoneAuthFlow({ initialFlow: 'signup', defaultGender: guestGender, onAuthenticated: finish })
  const isLogin = auth.flow === 'login'

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] px-5 dark:bg-zinc-950" edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="mx-auto w-full max-w-md flex-1 pb-28 pt-6">
          <Logo />

          <View className="mt-16">
            {auth.step === 'phone' && (
              <PhoneStep
                country={auth.country}
                onCountryChange={auth.setCountry}
                phone={auth.phone}
                onPhoneChange={auth.setPhone}
                onSubmit={auth.submitPhone}
                isPending={auth.isRequestingOtp}
                title={isLogin ? t('auth.loginTitle') : undefined}
                subtitle={isLogin ? t('auth.loginSubtitle') : undefined}
              />
            )}
            {auth.step === 'otp' && <OtpStep countryCode={auth.country.code} phone={auth.phone} onComplete={auth.submitOtp} isPending={auth.isVerifying} />}
            {auth.step === 'profile' && (
              <ProfileStep
                firstName={auth.firstName}
                onFirstNameChange={auth.setFirstName}
                lastName={auth.lastName}
                onLastNameChange={auth.setLastName}
                email={auth.email}
                onEmailChange={auth.setEmail}
                gender={auth.gender}
                onGenderChange={auth.setGender}
                onSubmit={auth.submitProfile}
                isPending={auth.isCreating}
              />
            )}
            {auth.step === 'not-found' && <AccountNotFoundStep onCreate={auth.createInsteadOfLogin} onUseAnotherNumber={auth.startOver} />}
            {auth.step === 'welcome-back' && <WelcomeBackStep name={auth.welcomeName} onContinue={finish} />}
            {auth.error ? <Text className="mt-3 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
            {auth.step === 'phone' || auth.step === 'otp' ? <AuthSwitchLink flow={auth.flow} onPress={auth.switchFlow} /> : null}
          </View>
        </View>

        {auth.step === 'phone' || auth.step === 'otp' ? (
          // A guest is exactly that — not signed in. The checkout sheet creates the account later, at their first Confirm.
          <Pressable onPress={finish} className="absolute inset-x-5 bottom-10 items-center py-4">
            <Text className="text-sm font-semibold text-stone-700 underline dark:text-zinc-300">{t('common.continueAsGuest')}</Text>
          </Pressable>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
