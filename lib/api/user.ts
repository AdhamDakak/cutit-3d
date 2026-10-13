import type { Gender } from '@/lib/app-state'
import { currentUser, type Address, type User } from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { hydrate, persist } from './_internal/persist'

const USER_STORAGE_KEY = '@cutit/user'
const ADDRESSES_STORAGE_KEY = '@cutit/addresses'
const ACCOUNTS_STORAGE_KEY = '@cutit/mock-accounts'

// There's only ever one mock user in this app, so every hook here can call
// this instead of taking a userId param — the seam is still real (a
// multi-user backend just fills in a different id per session).
let userStore: User = { ...currentUser }
let addressStore: Address[] = [...currentUser.addresses]

// MOCK "server" account registry: who has signed up, keyed by E.164 phone. Stands in for Supabase Auth's users table.
// It lives on this device, so an uninstall wipes it — a true "reinstall and log in" only works once the backend
// exists. signOut keeps it (the account still exists); deleteAccount removes the entry.
export type RegisteredAccount = { fullName: string; email: string; gender: Gender }

/**
 * "+20 100 123 4567" / "+20 01001234567" → "+201001234567": the dial code plus the national number's digits, with a
 * leading trunk 0 dropped. Inputs without a "+CC " prefix are just reduced to their digits.
 */
export function toE164(phone: string): string {
  const match = phone.trim().match(/^\+(\d{1,4})\s+(.*)$/)
  if (!match) return `+${phone.replace(/\D/g, '')}`
  return `+${match[1]}${match[2].replace(/\D/g, '').replace(/^0+/, '')}`
}

const seedAccounts = (): Record<string, RegisteredAccount> => ({
  [toE164(currentUser.phone)]: { fullName: currentUser.fullName, email: currentUser.email, gender: currentUser.gender },
})
let accountStore: Record<string, RegisteredAccount> = seedAccounts()

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
  hydrate(ACCOUNTS_STORAGE_KEY, seedAccounts).then((loaded) => {
    accountStore = loaded
  }),
]).then(() => undefined)

function setAccountStore(next: Record<string, RegisteredAccount>) {
  accountStore = next
  persist(ACCOUNTS_STORAGE_KEY, accountStore)
}

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

/** `isNewUser` tells the flow whether to ask for a profile (sign-up) or log the existing account in. */
export async function verifyOtp(phone: string, code: string): Promise<{ isNewUser: boolean }> {
  await ready
  await delay()
  if (phone.replace(/\D/g, '').length < 10) throw new Error('Invalid phone number')
  if (!/^\d{6}$/.test(code)) throw new Error('Invalid code')
  return { isNewUser: !accountStore[toE164(phone)] }
}

/** Thrown by logIn for a phone with no registered account. */
export class AccountNotFoundError extends Error {
  constructor() {
    super('No account found for this number')
    this.name = 'AccountNotFoundError'
  }
}

/**
 * Logs a returning user in (after a verified OTP): restores their name, email, and gender from the registry into the
 * current user record. The caller (useLogIn) flips the session. Same single mock record as completeProfile, so the
 * device's bookings/favorites stay attached.
 */
export async function logIn(phone: string): Promise<User> {
  await ready
  await delay()
  const account = accountStore[toE164(phone)]
  if (!account) throw new AccountNotFoundError()
  setUserStore({ ...userStore, ...account, phone: phone.trim() })
  userBus.invalidate()
  return userStore
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
  // Registers the account, so this number can log back in later instead of signing up again.
  const phone = input.phone?.trim() || userStore.phone
  if (phone) setAccountStore({ ...accountStore, [toE164(phone)]: { fullName: userStore.fullName, email: userStore.email, gender: userStore.gender } })
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
  const key = userStore.phone ? toE164(userStore.phone) : null
  if (key && accountStore[key]) setAccountStore({ ...accountStore, [key]: { ...accountStore[key], fullName: userStore.fullName, email: userStore.email } })
  userBus.invalidate()
  return userStore
}

// --- Account deletion ------------------------------------------------------

/** Thrown by deleteAccount while the wallet still holds money and the user hasn't agreed to forfeit it. */
export class WalletNotEmptyError extends Error {
  constructor() {
    super('Wallet balance must be 0 before deleting the account')
    this.name = 'WalletNotEmptyError'
  }
}

/**
 * MOCK account deletion (Apple requires it for any app with in-app sign-up). Cancels the user's upcoming bookings
 * (and their reminders), then empties every user-data store — bookings, reminder ids, addresses, the user record,
 * favorites, reviews, cards, wallet history, payment method, support tickets, chat, notifications — by writing empty
 * values rather than removing keys, so the seed data doesn't come back on the next launch. Device preferences
 * (language, theme, reminders toggle, onboarded) live in app-state and are untouched; the caller signs out.
 *
 * The real version is a backend function: it deletes the auth user and their personal data, and anonymises the
 * venue's copy of past bookings instead of deleting them.
 *
 * The other stores are loaded lazily because each of them already imports this module.
 */
export async function deleteAccount({ forfeitWalletBalance = false }: { forfeitWalletBalance?: boolean } = {}): Promise<void> {
  await ready
  await delay()
  // A remaining balance is lost on deletion, so it needs explicit consent. The real backend must enforce the same rule
  // server-side and record the forfeit consent (amount + timestamp), not just trust the client's flag.
  if (userStore.walletBalance > 0 && !forfeitWalletBalance) throw new WalletNotEmptyError()
  const userId = userStore.id
  const [bookings, favorites, reviews, payments, support, chat, notifications] = await Promise.all([
    import('./bookings'),
    import('./favorites'),
    import('./reviews'),
    import('./payments'),
    import('./support'),
    import('./chat'),
    import('./notifications'),
  ])
  await bookings.deleteBookingsForUser(userId)
  await Promise.all([
    favorites.deleteFavoritesForUser(userId),
    reviews.deleteReviewsForUser(userId),
    payments.deletePaymentData(),
    support.deleteTicketsForUser(userId),
    chat.clearChat(),
  ])
  setAddressStore([])
  if (userStore.phone) {
    const { [toE164(userStore.phone)]: _, ...remaining } = accountStore
    setAccountStore(remaining)
  }
  // Same id, so a later sign-up on this device starts from an empty record rather than the seeded demo user.
  setUserStore({ ...userStore, fullName: '', email: '', phone: '', avatarUrl: null, addresses: [], walletBalance: 0 })
  addressBus.invalidate()
  userBus.invalidate()
  await notifications.clearNotifications()
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
