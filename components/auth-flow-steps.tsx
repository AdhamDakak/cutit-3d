import { Pressable, Text, View } from 'react-native'
import { CheckCircle2, UserX } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { AuthFlow } from '@/components/usePhoneAuthFlow'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

/** "Already have an account? Log in" / "New to Cutit? Create an account" — shown on the phone and OTP steps. */
export function AuthSwitchLink({ flow, onPress }: { flow: AuthFlow; onPress: () => void }) {
  const { t } = useTranslation()
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} className="mt-5 items-center py-2">
      <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t(flow === 'login' ? 'auth.switchToSignup' : 'auth.switchToLogin')}</Text>
    </Pressable>
  )
}

/** Login with an unregistered number. "Create an account" continues to the profile step without another OTP. */
export function AccountNotFoundStep({ onCreate, onUseAnotherNumber }: { onCreate: () => void; onUseAnotherNumber: () => void }) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  return (
    <View>
      <View className="size-12 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
        <UserX size={22} color={colors.mutedStrong} />
      </View>
      <Text style={startAlign} className="mt-4 font-serif text-2xl font-semibold text-stone-900 dark:text-white">
        {t('auth.noAccountFound')}
      </Text>
      <Pressable onPress={onCreate} className="mt-6 w-full items-center rounded-xl bg-blue-600 py-3.5">
        <Text className="text-sm font-semibold text-white">{t('auth.createAnAccount')}</Text>
      </Pressable>
      <Pressable onPress={onUseAnotherNumber} className="mt-2 w-full items-center py-3">
        <Text className="text-sm font-semibold text-stone-700 dark:text-zinc-200">{t('auth.useAnotherNumber')}</Text>
      </Pressable>
    </View>
  )
}

/** Sign-up with a number that's already registered: they're logged in instead of getting a duplicate account. */
export function WelcomeBackStep({ name, onContinue }: { name: string; onContinue: () => void }) {
  const { t } = useTranslation()
  return (
    <View>
      <View className="size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CheckCircle2 size={24} color="#059669" />
      </View>
      <Text style={startAlign} className="mt-4 font-serif text-2xl font-semibold text-stone-900 dark:text-white">
        {t('auth.welcomeBackLoggedIn', { name })}
      </Text>
      <Pressable onPress={onContinue} className="mt-6 w-full items-center rounded-xl bg-blue-600 py-3.5">
        <Text className="text-sm font-semibold text-white">{t('common.continue')}</Text>
      </Pressable>
    </View>
  )
}
