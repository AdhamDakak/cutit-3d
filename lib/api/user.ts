import type { Gender } from '@/lib/app-state'
import { currentUser, type Address, type User } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'

// There's only ever one mock user in this app, so every hook here can call
// this instead of taking a userId param — the seam is still real (a
// multi-user backend just fills in a different id per session).
let userStore: User = { ...currentUser }
let addressStore: Address[] = [...currentUser.addresses]

const userBus = createInvalidationBus()
const addressBus = createInvalidationBus()
export const subscribeUser = userBus.subscribe
export const subscribeAddresses = addressBus.subscribe

export async function getCurrentUser(): Promise<User> {
  await delay()
  return userStore
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
  await delay()
  userStore = {
    ...userStore,
    fullName: input.fullName.trim(),
    email: input.email?.trim() ?? '',
    gender: input.gender,
    phone: input.phone?.trim() || userStore.phone,
  }
  userBus.invalidate()
  return userStore
}

// --- Addresses -------------------------------------------------------------

export async function listAddresses(): Promise<Address[]> {
  await delay()
  return addressStore
}

export async function addAddress(input: Omit<Address, 'id'>): Promise<Address> {
  await delay()
  const newAddress: Address = { ...input, id: `addr-${Date.now()}` }
  addressStore = [...addressStore, newAddress]
  addressBus.invalidate()
  return newAddress
}
