import { ANY_STAFF_ID, bookings as seedBookings, type Booking } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { getCurrentUser } from './user'

// The live, session-scoped store — a shallow copy of the seed data so
// mutations here never touch lib/data.ts's exported array. This is the
// "database" a real backend would own; everything below is the API that
// will eventually become real HTTP calls against it.
let store: Booking[] = [...seedBookings]

const bus = createInvalidationBus()
export const subscribeBookings = bus.subscribe

/**
 * MOCK ONLY. Stands in for the venue/stylist actually confirming a pending
 * booking (a real backend would flip this via a staff dashboard or
 * webhook, not a client-side timer). Moved here from lib/app-state.tsx —
 * delete this whole function, and its call sites below, once that exists.
 */
const MOCK_AUTO_CONFIRM_DELAY_MS = 5000

function scheduleMockAutoConfirm(bookingId: string) {
  setTimeout(() => {
    store = store.map((item) => (item.id === bookingId && item.status === 'pending' ? { ...item, status: 'confirmed' } : item))
    bus.invalidate()
  }, MOCK_AUTO_CONFIRM_DELAY_MS)
}

/** Internal — lets lib/api/slots.ts check live conflicts without a public mutation surface. */
export function getBookingsSnapshot(): Booking[] {
  return store
}

export async function listBookings(userId: string): Promise<Booking[]> {
  await delay()
  return store.filter((booking) => booking.userId === userId)
}

export async function getBooking(id: string): Promise<Booking | undefined> {
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

  store = [...store, booking]
  bus.invalidate()
  scheduleMockAutoConfirm(booking.id)
  return booking
}

export async function cancelBooking(id: string): Promise<void> {
  await delay()
  store = store.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item))
  bus.invalidate()
}

export async function rescheduleBooking(id: string, startTime: string, endTime: string): Promise<void> {
  await delay()
  store = store.map((item) => (item.id === id ? { ...item, startTime, endTime, status: 'pending' } : item))
  bus.invalidate()
  scheduleMockAutoConfirm(id)
}
