import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Sparkles } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { Logo } from '@/components/logo'
import { useAppState } from '@/lib/app-state'

export default function OnboardingScreen() {
  const { t } = useTranslation()
  const slides = t('onboarding.slides', { returnObjects: true }) as { title: string; body: string }[]
  const [slide, setSlide] = useState(0)
  const router = useRouter()
  const { completeOnboarding } = useAppState()

  const continueAsGuest = () => {
    completeOnboarding()
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center px-6">
        <Logo size="lg" />

        <View className="mt-12 size-40 items-center justify-center rounded-full bg-blue-50 dark:bg-zinc-900">
          <Sparkles size={64} color="#2563eb" />
        </View>

        <View className="mt-10 items-center">
          <Text className="text-center font-serif text-3xl font-semibold text-stone-900 dark:text-white">
            {slides[slide].title}
          </Text>
          <Text className="mx-auto mt-4 max-w-xs text-center text-sm leading-6 text-stone-500 dark:text-zinc-400">
            {slides[slide].body}
          </Text>
        </View>

        <View className="mt-8 flex-row justify-center gap-1.5">
          {slides.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => setSlide(index)}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.goToSlide', { number: index + 1 })}
              className={`h-1.5 rounded-full ${index === slide ? 'w-7 bg-blue-600' : 'w-1.5 bg-stone-300 dark:bg-zinc-700'}`}
            />
          ))}
        </View>

        <Pressable
          onPress={() => (slide < slides.length - 1 ? setSlide(slide + 1) : router.push('/auth'))}
          className="mt-10 w-full items-center rounded-xl bg-blue-600 py-3.5 active:opacity-90"
        >
          <Text className="text-sm font-semibold text-white">{slide < slides.length - 1 ? t('common.continue') : t('onboarding.getStarted')}</Text>
        </Pressable>
        <Pressable onPress={continueAsGuest} className="mt-4 w-full items-center py-3">
          <Text className="text-sm font-semibold text-stone-700 dark:text-zinc-300">{t('common.continueAsGuest')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
