import { useEffect, useRef, useState } from 'react'
import { I18nManager, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useThemeColors } from '@/lib/theme'

type Message = {
  id: number
  from: 'support' | 'user'
  text: string
}

export default function ChatSupportScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft
  const [messages, setMessages] = useState<Message[]>([{ id: 1, from: 'support', text: t('chatSupport.greeting') }])
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<ScrollView>(null)

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: prev.length + 1, from: 'user', text }])
    setDraft('')
  }

  // A composer that's visible above a list that hasn't followed it still
  // looks broken — scroll to the newest message both when it's sent and
  // when the keyboard itself rises (which can newly cover the tail of the
  // list even without a new message arriving).
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  useEffect(() => {
    const subscription = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => {
      scrollRef.current?.scrollToEnd({ animated: true })
    })
    return () => subscription.remove()
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.close')}
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <BackIcon size={18} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('chatSupport.title')}</Text>
        <View className="size-9" />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} className="flex-1" contentContainerClassName="gap-3 px-5 py-5" keyboardShouldPersistTaps="handled">
          {messages.map((message) => {
            // alignSelf doesn't auto-flip under RTL the way flexDirection: row
            // does, so "my messages" would stay stuck on the physical right
            // even in Arabic unless this is explicit — "my side" should be
            // the *logical* end of the reading direction.
            const isMine = message.from === 'user'
            const alignToEnd = I18nManager.isRTL ? !isMine : isMine
            return (
              <View key={message.id} className={`max-w-[80%] ${alignToEnd ? 'self-end' : 'self-start'}`}>
                <View
                  className={`rounded-2xl px-4 py-3 ${
                    isMine
                      ? `bg-blue-600 ${alignToEnd ? 'rounded-br-sm' : 'rounded-bl-sm'}`
                      : `border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 ${alignToEnd ? 'rounded-br-sm' : 'rounded-bl-sm'}`
                  }`}
                >
                  <Text className={`text-sm ${isMine ? 'text-white' : 'text-stone-900 dark:text-white'}`}>{message.text}</Text>
                </View>
              </View>
            )
          })}
        </ScrollView>

        <View className="flex-row items-end gap-2 border-t border-stone-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chatSupport.placeholder')}
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="center"
            className="max-h-28 min-h-11 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          />
          <Pressable
            onPress={send}
            disabled={!draft.trim()}
            accessibilityLabel={t('chatSupport.sendMessage')}
            className="size-11 items-center justify-center rounded-full bg-blue-600 disabled:opacity-40"
          >
            <Send size={18} color="#ffffff" style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
