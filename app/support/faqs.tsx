import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { SettingRow } from '@/components/settings-rows'
import { StackHeader } from '@/components/stack-header'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

type Faq = { q: string; a: string }

export default function FaqsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const faqs = t('faqs.items', { returnObjects: true }) as Faq[]
  // One answer open at a time; tapping the open one closes it.
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t('profile.faqs')} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-10 pt-5">
        <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {faqs.map((faq, index) => {
            const open = openIndex === index
            const Chevron = open ? ChevronUp : ChevronDown
            return (
              <View key={faq.q} className="border-b border-stone-100 dark:border-zinc-800">
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() => setOpenIndex(open ? null : index)}
                  className="min-h-14 flex-row items-center gap-3 px-4 py-3"
                >
                  <Text style={startAlign} className="flex-1 text-sm font-medium text-stone-900 dark:text-white">
                    {faq.q}
                  </Text>
                  <Chevron size={16} color={colors.muted} />
                </Pressable>
                {open ? (
                  <Text style={startAlign} className="px-4 pb-4 text-sm leading-6 text-stone-600 dark:text-zinc-300">
                    {faq.a}
                  </Text>
                ) : null}
              </View>
            )
          })}
        </View>

        <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <SettingRow icon={MessageCircle} label={t('faqs.stillNeedHelp')} value={t('help.chatWithTeam')} onPress={() => router.push('/chat-support')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
