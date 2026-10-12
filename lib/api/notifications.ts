import { notifications as seedNotifications, type AppNotification } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { hydrate, persist } from './_internal/persist'

// The in-app inbox. Mock: written locally by the other lib/api modules as things happen; a real backend would
// write these server-side (and fan them out as push) instead.
//
// Imported directly (not via lib/api/index) by bookings/payments/support and lib/notifications.ts, and it imports
// nothing from them, so there's no require cycle.

const STORAGE_KEY = '@cutit/notifications'

let store: AppNotification[] = [...seedNotifications]

const ready: Promise<void> = hydrate(STORAGE_KEY, () => seedNotifications).then((loaded) => {
  store = loaded
})

function setStore(next: AppNotification[]) {
  store = next
  persist(STORAGE_KEY, store)
}

const bus = createInvalidationBus()
export const subscribeNotifications = bus.subscribe

/** Newest first. */
export async function listNotifications(): Promise<AppNotification[]> {
  await ready
  await delay()
  return [...store].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function unreadCount(): Promise<number> {
  await ready
  return store.filter((item) => !item.readAt).length
}

export async function markRead(id: string): Promise<void> {
  await ready
  if (!store.some((item) => item.id === id && !item.readAt)) return
  const now = new Date().toISOString()
  setStore(store.map((item) => (item.id === id && !item.readAt ? { ...item, readAt: now } : item)))
  bus.invalidate()
}

export async function markAllRead(): Promise<void> {
  await ready
  if (!store.some((item) => !item.readAt)) return
  const now = new Date().toISOString()
  setStore(store.map((item) => (item.readAt ? item : { ...item, readAt: now })))
  bus.invalidate()
}

export type AddNotificationInput = Omit<AppNotification, 'id' | 'createdAt' | 'readAt'> & { read?: boolean }

/** Internal — called by the lib/api modules (and lib/notifications.ts for delivered reminders), never by screens. */
export async function addNotification({ read, ...input }: AddNotificationInput): Promise<AppNotification> {
  await ready
  const now = new Date().toISOString()
  const item: AppNotification = { ...input, id: `nt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: now, readAt: read ? now : null }
  setStore([...store, item])
  bus.invalidate()
  return item
}

/**
 * Records a delivered/tapped reminder at most once per booking + start time. `read` marks it read — the push was
 * tapped — creating it already-read if the reminder arrived while the app was closed and was never recorded.
 */
export async function recordReminder({ bookingId, name, at }: { bookingId: string; name: string; at: string }, { read }: { read: boolean }) {
  await ready
  const existing = store.find((item) => item.type === 'reminder' && item.bookingId === bookingId && item.params.at === at)
  if (!existing) {
    await addNotification({ type: 'reminder', bookingId, params: { name, at }, read })
    return
  }
  if (read) await markRead(existing.id)
}
