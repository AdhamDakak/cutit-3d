import type { ChatMessage } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { hydrate, persist } from './_internal/persist'

// MOCK support chat, kept on the device so the conversation survives closing the screen. The real version is a
// messages table (one conversation per user) with Supabase Realtime pushing the team's replies in.

const STORAGE_KEY = '@cutit/chat'
const AUTO_REPLY_DELAY_MS = 1500

type ChatStore = { messages: ChatMessage[]; draft: string; autoReplied: boolean }

const greeting = (): ChatMessage => ({ id: 'msg-greeting', from: 'support', text: '', kind: 'greeting', createdAt: new Date().toISOString() })
const emptyStore = (): ChatStore => ({ messages: [greeting()], draft: '', autoReplied: false })

let store: ChatStore = emptyStore()

// Seeds the greeting whenever the stored conversation is empty, not only on a first-ever launch.
const ready: Promise<void> = hydrate(STORAGE_KEY, emptyStore).then((loaded) => {
  store = loaded.messages.length > 0 ? loaded : { ...loaded, messages: [greeting()] }
})

function setStore(next: ChatStore) {
  store = next
  persist(STORAGE_KEY, store)
}

const bus = createInvalidationBus()
export const subscribeChat = bus.subscribe

/** Oldest first. A local read, so no fake latency — the conversation opens instantly. */
export async function listMessages(): Promise<ChatMessage[]> {
  await ready
  return store.messages
}

/**
 * Adds the message right away (it shows the moment Send is tapped), then waits out the fake network latency. The
 * first user message in a conversation gets one canned support reply ~1.5 s later; later ones don't.
 */
export async function sendMessage(text: string): Promise<ChatMessage> {
  await ready
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Message is empty')
  const message: ChatMessage = { id: `msg-${Date.now()}`, from: 'user', text: trimmed, createdAt: new Date().toISOString() }
  const shouldAutoReply = !store.autoReplied
  setStore({ ...store, messages: [...store.messages, message], autoReplied: true })
  bus.invalidate()
  if (shouldAutoReply) {
    setTimeout(() => {
      const reply: ChatMessage = { id: `msg-${Date.now()}`, from: 'support', text: '', kind: 'auto-reply', createdAt: new Date().toISOString() }
      setStore({ ...store, messages: [...store.messages, reply] })
      bus.invalidate()
    }, AUTO_REPLY_DELAY_MS)
  }
  await delay()
  return message
}

export async function getDraft(): Promise<string> {
  await ready
  return store.draft
}

/** Saved on every keystroke; deliberately doesn't invalidate, so typing never triggers a refetch of the thread. */
export async function setDraft(text: string): Promise<void> {
  await ready
  if (store.draft === text) return
  setStore({ ...store, draft: text })
}

/** Internal — part of deleteAccount (lib/api/user.ts). Back to just the greeting, with no draft and a fresh auto-reply. */
export async function clearChat(): Promise<void> {
  await ready
  setStore(emptyStore())
  bus.invalidate()
}
