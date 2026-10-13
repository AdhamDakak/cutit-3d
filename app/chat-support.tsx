import { useEffect, useRef, useState } from 'react'
import { I18nManager, Keyboard, LayoutAnimation, Platform, Pressable, ScrollView, Text, TextInput, View, type KeyboardEvent } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { ChatMessage } from '@/lib/data'
import { saveChatDraft, useChatDraft, useChatMessages, useSendChatMessage } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

/** Moves the layout with the keyboard (same duration + curve) instead of letting it jump. */
function animateWithKeyboard(event: KeyboardEvent) {
  if (!event.duration) return
  const duration = Math.max(event.duration, 10)
  LayoutAnimation.configureNext({ duration, update: { duration, type: LayoutAnimation.Types[event.easing] ?? LayoutAnimation.Types.keyboard } })
}

export default function ChatSupportScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft
  const scrollRef = useRef<ScrollView>(null)

  // The conversation and the unsent draft live in lib/api/chat.ts, so closing and reopening (from any entry point)
  // shows the same thread and draft. The draft is null until typed, so it picks up the stored one once it loads.
  const { data: messages } = useChatMessages()
  const { data: storedDraft } = useChatDraft()
  const { mutate: sendMessage } = useSendChatMessage()
  const [typedDraft, setTypedDraft] = useState<string | null>(null)
  const draft = typedDraft ?? storedDraft ?? ''

  // No KeyboardAvoidingView: it needs this screen's window position, which an iOS sheet's native offset hides from
  // RN layout. A phone sheet always reaches the bottom of the screen, though, so the keyboard covers exactly its own
  // height of it — padding the screen by that height puts the composer right on top of the keyboard.
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, (event) => {
      animateWithKeyboard(event)
      setKeyboardHeight(event.endCoordinates.height)
    })
    const hide = Keyboard.addListener(HIDE_EVENT, (event) => {
      animateWithKeyboard(event)
      setKeyboardHeight(0)
    })
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  // Keep the newest message in view when one arrives and when the keyboard shrinks the list (its onLayout below).
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
  }, [messages?.length])

  const changeDraft = (text: string) => {
    setTypedDraft(text)
    saveChatDraft(text)
  }

  const send = () => {
    const text = draft.trim()
    if (!text) return
    changeDraft('')
    sendMessage(text).catch(() => changeDraft(text))
  }

  const messageText = (message: ChatMessage) =>
    message.kind === 'greeting' ? t('chatSupport.greeting') : message.kind === 'auto-reply' ? t('chatSupport.autoReply') : message.text

  return (
    // edges top: 0 inside an iOS sheet (it already starts below the status bar), the status-bar inset on Android,
    // where 'modal' is full-screen. The bottom inset is applied by hand on the composer instead.
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top']}>
      {/* Keyboard padding on its own View, so it never mixes with the padding SafeAreaView applies for its insets. */}
      <View style={{ flex: 1, paddingBottom: keyboardHeight }}>
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

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="gap-3 px-5 py-5"
          keyboardShouldPersistTaps="handled"
          onLayout={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {(messages ?? []).map((message) => {
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
                  <Text className={`text-sm ${isMine ? 'text-white' : 'text-stone-900 dark:text-white'}`}>{messageText(message)}</Text>
                </View>
              </View>
            )
          })}
        </ScrollView>

        {/* The keyboard's height already includes the home-indicator area, so the bottom inset drops to 0 while it's up. */}
        <View
          style={{ paddingBottom: 12 + (keyboardHeight > 0 ? 0 : insets.bottom) }}
          className="flex-row items-end gap-2 border-t border-stone-200 bg-white px-4 pt-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <TextInput
            value={draft}
            onChangeText={changeDraft}
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
            {/* Mirror on a wrapping View, not the SVG: a View flips around its centre, while a transform on the lucide
                SVG flips around its top-left corner and pushes the glyph out of the button. */}
            <View style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
              <Send size={18} color="#ffffff" />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
