import { getDraft, listMessages, sendMessage, setDraft, subscribeChat } from '@/lib/api'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

export function useChatMessages() {
  return useAsync(() => listMessages(), [], subscribeChat)
}

/** Read once when the screen opens; the screen keeps the live draft in local state and writes it back via saveChatDraft. */
export function useChatDraft() {
  return useAsync(() => getDraft(), [])
}

export function useSendChatMessage() {
  return useMutation((text: string) => sendMessage(text))
}

export function saveChatDraft(text: string) {
  setDraft(text).catch(() => {})
}
