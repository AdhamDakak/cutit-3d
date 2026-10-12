import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { LEGAL_LAST_UPDATED, legalContent, type LegalDocumentId } from '@/content/legal'
import { StackHeader } from '@/components/stack-header'
import type { AppLanguage } from '@/lib/i18n'
import { startAlign } from '@/lib/rtl'

/** Shared body of app/legal/terms.tsx and app/legal/privacy.tsx: draft banner + headed sections in the active language. */
export function LegalDocumentScreen({ document, title }: { document: LegalDocumentId; title: string }) {
  const { t, i18n } = useTranslation()
  const language: AppLanguage = i18n.language === 'ar' ? 'ar' : 'en'
  const { sections } = legalContent[language][document]
  const date = new Date(`${LEGAL_LAST_UPDATED}T12:00:00`).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={title} />
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-12 pt-5">
        <View className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/20">
          <Text style={startAlign} className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            {t('legal.draftUpdated', { date })}
          </Text>
        </View>
        {sections.map((section) => (
          <View key={section.heading} className="gap-2">
            <Text style={startAlign} className="font-serif text-lg font-semibold text-stone-900 dark:text-white">
              {section.heading}
            </Text>
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={startAlign} className="text-sm leading-6 text-stone-600 dark:text-zinc-300">
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
