import { listNotifications, markAllRead, markRead, subscribeNotifications, unreadCount } from '@/lib/api'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

export function useNotifications() {
  return useAsync(() => listNotifications(), [], subscribeNotifications)
}

/** Drives both bells' badges; both subscribe to the same bus, so reading anything clears them together. */
export function useUnreadNotificationCount() {
  return useAsync(() => unreadCount(), [], subscribeNotifications)
}

export function useMarkNotificationRead() {
  return useMutation((id: string) => markRead(id))
}

export function useMarkAllNotificationsRead() {
  return useMutation(() => markAllRead())
}
