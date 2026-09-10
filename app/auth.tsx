import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { Logo } from '@/components/logo'
import { useAppState } from '@/lib/app-state'

type Step = 'phone' | 'otp' | 'profile'

export default function AuthScreen() {
  const [phone, setPhone] = useState('+20 ')
  const [step, setStep] = useState<Step>('phone')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const router = useRouter()
  const { signIn, completeOnboarding } = useAppState()

  const finish = () => {
    signIn()
    completeOnboarding()
    router.replace('/(tabs)')
  }

  const inputClass =
    'mt-8 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white'

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] px-5 dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="mx-auto w-full max-w-md flex-1 pt-6">
        <Logo />
        <Pressable onPress={finish} className="mt-8 self-start">
          <Text className="text-sm text-stone-500 dark:text-zinc-400">Continue as Guest</Text>
        </Pressable>

        {step === 'phone' && (
          <View className="mt-16">
            <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">Welcome to Cutit</Text>
            <Text className="mt-3 text-sm text-stone-500 dark:text-zinc-400">Sign in with your mobile number.</Text>
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" className={inputClass} />
            <Pressable
              onPress={() => setStep('otp')}
              disabled={phone.replace(/\D/g, '').length < 10}
              className="mt-4 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40"
            >
              <Text className="text-sm font-semibold text-white">Send OTP</Text>
            </Pressable>
          </View>
        )}

        {step === 'otp' && (
          <View className="mt-16">
            <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">Verify your number</Text>
            <TextInput
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="Enter 6-digit code"
              className={`${inputClass} text-center text-lg tracking-[8px]`}
            />
            <Text className="mt-3 text-center text-xs text-stone-500 dark:text-zinc-400">Resend code in 30s</Text>
            <Pressable
              onPress={() => setStep('profile')}
              disabled={otp.length < 4}
              className="mt-6 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40"
            >
              <Text className="text-sm font-semibold text-white">Verify & Continue</Text>
            </Pressable>
          </View>
        )}

        {step === 'profile' && (
          <View className="mt-16">
            <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">Create your profile</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Full name" className={inputClass} />
            <TextInput placeholder="Email address (optional)" className={`${inputClass} mt-3`} />
            <Pressable
              onPress={finish}
              disabled={!name.trim()}
              className="mt-6 w-full items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-40"
            >
              <Text className="text-sm font-semibold text-white">Continue</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
