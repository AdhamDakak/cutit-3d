import {
  defaultPaymentMethod as seedPaymentMethod,
  savedCards as seedCards,
  walletTransactions as seedTransactions,
  type PaymentMethodType,
  type SavedCard,
  type WalletTransaction,
} from '@/lib/data'
import { delay } from './_internal/delay'
import { createInvalidationBus } from './_internal/bus'
import { hydrate, persist } from './_internal/persist'
import { addNotification } from './notifications'
import { adjustWalletBalance, getCurrentUser } from './user'

// MOCK payments — no money moves anywhere. Paymob arrives with the backend: top-ups become a Paymob checkout, and
// cards are added only through its hosted card form, never a form in this app (see the SECURITY note in lib/data.ts).

const CARDS_STORAGE_KEY = '@cutit/cards'
const TRANSACTIONS_STORAGE_KEY = '@cutit/wallet-transactions'
const METHOD_STORAGE_KEY = '@cutit/payment-method'

let cardStore: SavedCard[] = [...seedCards]
let transactionStore: WalletTransaction[] = [...seedTransactions]
let methodStore: PaymentMethodType = seedPaymentMethod

const ready: Promise<void> = Promise.all([
  hydrate(CARDS_STORAGE_KEY, () => seedCards),
  hydrate(TRANSACTIONS_STORAGE_KEY, () => seedTransactions),
  hydrate<PaymentMethodType>(METHOD_STORAGE_KEY, () => seedPaymentMethod),
]).then(([cards, transactions, method]) => {
  cardStore = cards
  transactionStore = transactions
  methodStore = method
})

function setCards(next: SavedCard[]) {
  cardStore = next
  persist(CARDS_STORAGE_KEY, cardStore)
}

function setTransactions(next: WalletTransaction[]) {
  transactionStore = next
  persist(TRANSACTIONS_STORAGE_KEY, transactionStore)
}

function setMethod(next: PaymentMethodType) {
  methodStore = next
  persist(METHOD_STORAGE_KEY, methodStore)
}

const bus = createInvalidationBus()
export const subscribePayments = bus.subscribe

export type Wallet = { balanceEGP: number; transactions: WalletTransaction[] }

/** Balance (kept on User.walletBalance) plus history, newest first. */
export async function getWallet(): Promise<Wallet> {
  await ready
  await delay()
  const user = await getCurrentUser()
  return { balanceEGP: user.walletBalance, transactions: [...transactionStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }
}

export const MAX_TOP_UP_EGP = 10000

/** Mock top-up: adds to the balance and records a 'topup' transaction. */
export async function topUpWallet(amountEGP: number): Promise<Wallet> {
  await ready
  await delay()
  if (!Number.isInteger(amountEGP) || amountEGP <= 0 || amountEGP > MAX_TOP_UP_EGP) throw new Error('Invalid top-up amount')
  await adjustWalletBalance(amountEGP)
  setTransactions([...transactionStore, { id: `wt-${Date.now()}`, type: 'topup', amountEGP, createdAt: new Date().toISOString() }])
  bus.invalidate()
  addNotification({ type: 'wallet_topup', params: { amount: amountEGP } }).catch(() => {})
  return getWallet()
}

export async function listCards(): Promise<SavedCard[]> {
  await ready
  await delay()
  return cardStore
}

/** Removing the default card promotes the next one; removing the last card moves a 'card' preference to cash. */
export async function removeCard(id: string): Promise<void> {
  await ready
  await delay()
  const removed = cardStore.find((card) => card.id === id)
  const remaining = cardStore.filter((card) => card.id !== id)
  setCards(removed?.isDefault && remaining.length > 0 ? remaining.map((card, index) => ({ ...card, isDefault: index === 0 })) : remaining)
  if (remaining.length === 0 && methodStore === 'card') setMethod('cash')
  bus.invalidate()
}

export async function setDefaultCard(id: string): Promise<void> {
  await ready
  await delay()
  if (!cardStore.some((card) => card.id === id)) throw new Error('Card not found')
  setCards(cardStore.map((card) => ({ ...card, isDefault: card.id === id })))
  bus.invalidate()
}

export async function getDefaultPaymentMethod(): Promise<PaymentMethodType> {
  await ready
  await delay()
  return methodStore
}

/** Rejects 'card' with no saved card and 'wallet' at a zero balance — the same rules the picker screen shows. */
export async function setDefaultPaymentMethod(type: PaymentMethodType): Promise<void> {
  await ready
  await delay()
  if (type === 'card' && cardStore.length === 0) throw new Error('No saved card')
  if (type === 'wallet' && (await getCurrentUser()).walletBalance <= 0) throw new Error('Wallet is empty')
  setMethod(type)
  bus.invalidate()
}

/** Internal — part of deleteAccount (lib/api/user.ts). Cards and history are this device's single user's; the preference resets to cash. */
export async function deletePaymentData(): Promise<void> {
  await ready
  setCards([])
  setTransactions([])
  setMethod('cash')
  bus.invalidate()
}
