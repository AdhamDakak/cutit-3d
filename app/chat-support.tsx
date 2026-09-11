import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, Send } from 'lucide-react-native'

import { useThemeColors } from '@/lib/theme'

type Message = {
  id: number
  from: 'support' | 'user'
  text: string
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, from: 'support', text: "Hi! I'm here to help with bookings, payments, or anything else. What's up?" },
]

export default function ChatSupportScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: prev.length + 1, from: 'user', text }])
    setDraft('')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Close"
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">Chat Support</Text>
        <View className="size-9" />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView className="flex-1" contentContainerClassName="gap-3 px-5 py-5">
          {messages.map((message) => (
            <View key={message.id} className={`max-w-[80%] ${message.from === 'user' ? 'self-end' : 'self-start'}`}>
              <View
                className={`rounded-2xl px-4 py-3 ${
                  message.from === 'user'
                    ? 'rounded-br-sm bg-blue-600'
                    : 'rounded-bl-sm border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                }`}
              >
                <Text className={`text-sm ${message.from === 'user' ? 'text-white' : 'text-stone-900 dark:text-white'}`}>{message.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="flex-row items-end gap-2 border-t border-stone-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            multiline
            className="max-h-28 min-h-11 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          />
          <Pressable
            onPress={send}
            disabled={!draft.trim()}
            accessibilityLabel="Send message"
            className="size-11 items-center justify-center rounded-full bg-blue-600 disabled:opacity-40"
          >
            <Send size={18} color="#ffffff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
