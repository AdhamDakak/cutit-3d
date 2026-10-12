import type { Gender } from '@/lib/app-state'
import { currentUser, type Address, type User } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { hydrate, persist } from './_internal/persist'

const USER_STORAGE_KEY = '@cutit/user'
const ADDRESSES_STORAGE_KEY = '@cutit/addresses'

// There's only ever one mock user in this app, so every hook here can call
// this instead of taking a userId param — the seam is still real (a
// multi-user backend just fills in a different id per session).
let userStore: User = { ...currentUser }
let addressStore: Address[] = [...currentUser.addresses]

// Hydrates both stores from storage once at import time, falling back
// to the seed above on a first-ever launch. Every exported function below
// awaits this before touching either store.
const ready: Promise<void> = Promise.all([
  hydrate(USER_STORAGE_KEY, () => userStore).then((loaded) => {
    userStore = loaded
  }),
  hydrate(ADDRESSES_STORAGE_KEY, () => addressStore).then((loaded) => {
    addressStore = loaded
  }),
]).then(() => undefined)

function setUserStore(next: User) {
  userStore = next
  persist(USER_STORAGE_KEY, userStore)
}

function setAddressStore(next: Address[]) {
  addressStore = next
  persist(ADDRESSES_STORAGE_KEY, addressStore)
}

const userBus = createInvalidationBus()
const addressBus = createInvalidationBus()
export const subscribeUser = userBus.subscribe
export const subscribeAddresses = addressBus.subscribe

export async function getCurrentUser(): Promise<User> {
  await ready
  await delay()
  return userStore
}

/** Internal — lets lib/api/payments.ts move the wallet balance (which lives on User) without a public mutation surface. */
export async function adjustWalletBalance(deltaEGP: number): Promise<number> {
  await ready
  setUserStore({ ...userStore, walletBalance: userStore.walletBalance + deltaEGP })
  userBus.invalidate()
  return userStore.walletBalance
}

// --- Phone auth ------------------------------------------------------------
// Mock: any well-formed phone gets a "code", any 6 digits verify. A real
// backend (Supabase phone OTP via Twilio/Vonage) replaces these two bodies
// and nothing above them changes.

export async function requestOtp(phone: string): Promise<void> {
  await delay()
  if (phone.replace(/\D/g, '').length < 10) throw new Error('Invalid phone number')
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  await delay()
  if (phone.replace(/\D/g, '').length < 10) throw new Error('Invalid phone number')
  if (!/^\d{6}$/.test(code)) throw new Error('Invalid code')
}

export type CompleteProfileInput = {
  fullName: string
  email?: string
  gender: Gender
  /** Dial code + number as entered at sign-up; kept on the record so Profile shows it. */
  phone?: string
}

/**
 * "Creates the account" in mock terms: overwrites the single user record
 * in place. The id stays `currentUser.id` on purpose — bookings and
 * favorites are keyed by it, so the just-created guest booking (and the
 * seed history) stay attached to the new account.
 */
export async function completeProfile(input: CompleteProfileInput): Promise<User> {
  await ready
  await delay()
  setUserStore({
    ...userStore,
    fullName: input.fullName.trim(),
    email: input.email?.trim() ?? '',
    gender: input.gender,
    phone: input.phone?.trim() || userStore.phone,
  })
  userBus.invalidate()
  return userStore
}

export type UpdateProfileInput = { fullName?: string; email?: string }

/**
 * Edits the signed-in user's name and/or email in place. Phone is deliberately not editable here: once real auth
 * exists, changing it has to go through OTP re-verification of the new number, not a plain field update.
 */
export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  await ready
  await delay()
  setUserStore({
    ...userStore,
    ...(input.fullName !== undefined ? { fullName: input.fullName.trim() } : null),
    ...(input.email !== undefined ? { email: input.email.trim() } : null),
  })
  userBus.invalidate()
  return userStore
}

// --- Addresses -------------------------------------------------------------

/** Thrown by deleteAddress when a pending/confirmed booking still points at the address. */
export class AddressInUseError extends Error {
  constructor() {
    super('This address is used by an upcoming booking')
    this.name = 'AddressInUseError'
  }
}

export type AddressInput = Omit<Address, 'id'>

export async function listAddresses(): Promise<Address[]> {
  await ready
  await delay()
  return addressStore
}

export async function addAddress(input: AddressInput): Promise<Address> {
  await ready
  await delay()
  const newAddress: Address = { ...input, id: `addr-${Date.now()}` }
  setAddressStore([...addressStore, newAddress])
  addressBus.invalidate()
  return newAddress
}

export async function updateAddress(id: string, input: Partial<AddressInput>): Promise<Address> {
  await ready
  await delay()
  const existing = addressStore.find((address) => address.id === id)
  if (!existing) throw new Error('Address not found')
  const updated: Address = { ...existing, ...input, id }
  setAddressStore(addressStore.map((address) => (address.id === id ? updated : address)))
  addressBus.invalidate()
  return updated
}

export async function deleteAddress(id: string): Promise<void> {
  await ready
  await delay()
  // Loaded lazily: bookings.ts already imports this module, so a top-level import would be a require cycle.
  const { getBookingsSnapshot } = await import('./bookings')
  const bookings = await getBookingsSnapshot()
  if (bookings.some((booking) => booking.addressId === id && (booking.status === 'pending' || booking.status === 'confirmed'))) {
    throw new AddressInUseError()
  }
  setAddressStore(addressStore.filter((address) => address.id !== id))
  addressBus.invalidate()
}
