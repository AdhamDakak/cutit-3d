import { ANY_STAFF_ID, bookings as seedBookings, stylists, venues, type Booking } from '@/lib/data'
import { areRemindersEnabled, cancelAllReminders, cancelReminder, scheduleBookingReminder } from '@/lib/notifications'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { hydrate, persist } from './_internal/persist'
import { addNotification } from './notifications'
import { getCurrentUser } from './user'

const STORAGE_KEY = '@cutit/bookings'
const REMINDERS_STORAGE_KEY = '@cutit/booking-reminders'

// The live, session-scoped store — a shallow copy of the seed data so
// mutations here never touch lib/data.ts's exported array. This is the
// "database" a real backend would own; everything below is the API that
// will eventually become real HTTP calls against it.
let store: Booking[] = [...seedBookings]

// Hydrates `store` from storage once at import time, falling back to
// the seed above on a first-ever launch. Every exported function below
// awaits this before touching `store`, so a call is never served from stale
// seed data while the persisted value is still loading.
// Booking id -> scheduled local reminder's notification id. Kept beside the store rather than on Booking: the id is
// only meaningful on this device, so it stays client-side once bookings come from a real backend.
let reminderIds: Record<string, string> = {}

const ready: Promise<void> = Promise.all([
  hydrate(STORAGE_KEY, () => seedBookings),
  hydrate<Record<string, string>>(REMINDERS_STORAGE_KEY, () => ({})),
]).then(([loadedBookings, loadedReminders]) => {
  store = loadedBookings
  reminderIds = loadedReminders
})

function setStore(next: Booking[]) {
  store = next
  persist(STORAGE_KEY, store)
}

function setReminderIds(next: Record<string, string>) {
  reminderIds = next
  persist(REMINDERS_STORAGE_KEY, reminderIds)
}

async function clearReminder(bookingId: string) {
  const notificationId = reminderIds[bookingId]
  if (!notificationId) return
  const { [bookingId]: _, ...rest } = reminderIds
  setReminderIds(rest)
  await cancelReminder(notificationId)
}

/** The venue's or stylist's name — what reminders and inbox items call the booking. */
function bookingName(booking: Booking) {
  return (booking.venueId ? venues.find((item) => item.id === booking.venueId)?.name : stylists.find((item) => item.id === booking.stylistId)?.name) ?? 'Cutit'
}

/** Writes an inbox item for a booking event. Fire-and-forget, like reminders: it must never fail the mutation. */
function notifyBooking(type: 'booking_pending' | 'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled', booking: Booking) {
  addNotification({ type, bookingId: booking.id, params: { name: bookingName(booking), at: booking.startTime } }).catch(() => {})
}

/** Replaces any existing reminder for `booking` with a fresh one 1 hour before its (possibly new) start time. */
async function setReminder(booking: Booking, options: { prompt: boolean }) {
  await clearReminder(booking.id)
  const notificationId = await scheduleBookingReminder({ bookingId: booking.id, name: bookingName(booking), startTime: booking.startTime }, options)
  if (notificationId) setReminderIds({ ...reminderIds, [booking.id]: notificationId })
}

/**
 * Brings scheduled reminders in line with the "Appointment reminders" preference: when off, cancels every scheduled
 * reminder; when on, schedules one for each upcoming booking that lacks one. Never prompts for permission.
 */
export async function syncBookingReminders(): Promise<void> {
  await ready
  if (!areRemindersEnabled()) {
    setReminderIds({})
    await cancelAllReminders()
    return
  }
  const user = await getCurrentUser()
  const upcoming = store.filter(
    (booking) => booking.userId === user.id && booking.status !== 'cancelled' && !reminderIds[booking.id] && new Date(booking.startTime).getTime() > Date.now(),
  )
  for (const booking of upcoming) await setReminder(booking, { prompt: false })
}

const bus = createInvalidationBus()
export const subscribeBookings = bus.subscribe

/**
 * MOCK ONLY. Stands in for the venue/stylist actually confirming a pending
 * booking (a real backend would flip this via a staff dashboard or
 * webhook, not a client-side timer). Moved here from lib/app-state.tsx —
 * delete this whole function, and its call sites below, once that exists.
 * The timer itself is not persisted (nothing needs to survive a reload
 * mid-countdown) — only the status it eventually writes is.
 */
const MOCK_AUTO_CONFIRM_DELAY_MS = 5000

function scheduleMockAutoConfirm(bookingId: string) {
  setTimeout(() => {
    const target = store.find((item) => item.id === bookingId && item.status === 'pending')
    if (!target) return
    const confirmed: Booking = { ...target, status: 'confirmed' }
    setStore(store.map((item) => (item.id === bookingId ? confirmed : item)))
    bus.invalidate()
    notifyBooking('booking_confirmed', confirmed)
  }, MOCK_AUTO_CONFIRM_DELAY_MS)
}

/** Internal — lets lib/api/slots.ts check live conflicts without a public mutation surface. */
export async function getBookingsSnapshot(): Promise<Booking[]> {
  await ready
  return store
}

export async function listBookings(userId: string): Promise<Booking[]> {
  await ready
  await delay()
  return store.filter((booking) => booking.userId === userId)
}

export async function getBooking(id: string): Promise<Booking | undefined> {
  await ready
  await delay()
  return store.find((booking) => booking.id === id)
}

/**
 * Everything the client can specify about a new booking. `id`, `status`,
 * `createdAt`, and `userId` are the server's job (mocked below) — a real
 * backend would derive `userId` from the auth session, not trust a
 * client-supplied value.
 */
export type CreateBookingInput = Omit<Booking, 'id' | 'createdAt' | 'status' | 'anyStaff' | 'userId'>

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  await ready
  await delay()
  const user = await getCurrentUser()
  const anyStaff = input.staffId === ANY_STAFF_ID

  const booking: Booking = {
    ...input,
    userId: user.id,
    staffId: anyStaff ? null : input.staffId,
    anyStaff: anyStaff ? true : undefined,
    id: `bk-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  setStore([...store, booking])
  bus.invalidate()
  scheduleMockAutoConfirm(booking.id)
  // Fire-and-forget: the first booking is where notification permission gets asked, and neither the prompt nor a
  // scheduling failure should hold up or fail the booking itself.
  void setReminder(booking, { prompt: true })
  notifyBooking('booking_pending', booking)
  return booking
}

export async function cancelBooking(id: string): Promise<void> {
  await ready
  await delay()
  setStore(store.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item)))
  bus.invalidate()
  void clearReminder(id)
  const cancelled = store.find((item) => item.id === id)
  if (cancelled) notifyBooking('booking_cancelled', cancelled)
}

export async function rescheduleBooking(id: string, startTime: string, endTime: string): Promise<void> {
  await ready
  await delay()
  setStore(store.map((item) => (item.id === id ? { ...item, startTime, endTime, status: 'pending' } : item)))
  bus.invalidate()
  scheduleMockAutoConfirm(id)
  const booking = store.find((item) => item.id === id)
  if (booking) {
    void setReminder(booking, { prompt: false })
    notifyBooking('booking_rescheduled', booking)
  }
}

/**
 * Internal — part of deleteAccount (lib/api/user.ts). Cancels the user's upcoming bookings first (which also cancels
 * their reminders, and is what a venue would see), then drops all of the user's bookings and any leftover reminder ids.
 */
export async function deleteBookingsForUser(userId: string): Promise<void> {
  await ready
  const upcoming = store.filter((booking) => booking.userId === userId && (booking.status === 'pending' || booking.status === 'confirmed'))
  for (const booking of upcoming) await cancelBooking(booking.id)
  await Promise.all(Object.values(reminderIds).map((notificationId) => cancelReminder(notificationId)))
  setReminderIds({})
  setStore(store.filter((booking) => booking.userId !== userId))
  bus.invalidate()
}
