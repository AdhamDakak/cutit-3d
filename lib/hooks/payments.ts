import {
  getDefaultPaymentMethod,
  getWallet,
  listCards,
  removeCard,
  setDefaultCard,
  setDefaultPaymentMethod,
  subscribePayments,
  topUpWallet,
} from '@/lib/api'
import type { PaymentMethodType } from '@/lib/data'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

export function useWallet() {
  return useAsync(() => getWallet(), [], subscribePayments)
}

export function useTopUpWallet() {
  return useMutation((amountEGP: number) => topUpWallet(amountEGP))
}

export function useCards() {
  return useAsync(() => listCards(), [], subscribePayments)
}

export function useRemoveCard() {
  return useMutation((id: string) => removeCard(id))
}

export function useSetDefaultCard() {
  return useMutation((id: string) => setDefaultCard(id))
}

export function useDefaultPaymentMethod() {
  return useAsync(() => getDefaultPaymentMethod(), [], subscribePayments)
}

export function useSetDefaultPaymentMethod() {
  return useMutation((type: PaymentMethodType) => setDefaultPaymentMethod(type))
}
