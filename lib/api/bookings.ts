import { ANY_STAFF_ID, bookings as seedBookings, type Booking } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { hydrate, persist } from './_internal/persist'
import { getCurrentUser } from './user'

const STORAGE_KEY = '@cutit/bookings'

// The live, session-scoped store — a shallow copy of the seed data so
// mutations here never touch lib/data.ts's exported array. This is the
// "database" a real backend would own; everything below is the API that
// will eventually become real HTTP calls against it.
let store: Booking[] = [...seedBookings]

// Hydrates `store` from AsyncStorage once at import time, falling back to
// the seed above on a first-ever launch. Every exported function below
// awaits this before touching `store`, so a call is never served from stale
// seed data while the persisted value is still loading.
const ready: Promise<void> = hydrate(STORAGE_KEY, () => seedBookings).then((loaded) => {
  store = loaded
})

function setStore(next: Booking[]) {
  store = next
  persist(STORAGE_KEY, store)
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
    setStore(store.map((item) => (item.id === bookingId && item.status === 'pending' ? { ...item, status: 'confirmed' } : item)))
    bus.invalidate()
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
  return booking
}

export async function cancelBooking(id: string): Promise<void> {
  await ready
  await delay()
  setStore(store.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item)))
  bus.invalidate()
}

export async function rescheduleBooking(id: string, startTime: string, endTime: string): Promise<void> {
  await ready
  await delay()
  setStore(store.map((item) => (item.id === id ? { ...item, startTime, endTime, status: 'pending' } : item)))
  bus.invalidate()
  scheduleMockAutoConfirm(id)
}
