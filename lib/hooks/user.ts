import {
  addAddress,
  completeProfile,
  deleteAccount,
  deleteAddress,
  getCurrentUser,
  listAddresses,
  requestOtp,
  subscribeAddresses,
  subscribeUser,
  updateAddress,
  updateProfile,
  verifyOtp,
  type AddressInput,
  type CompleteProfileInput,
  type UpdateProfileInput,
} from '@/lib/api'
import { useAppState } from '@/lib/app-state'
import { useAsync } from './useAsync'
import { useMutation } from './useMutation'

export function useCurrentUser() {
  return useAsync(() => getCurrentUser(), [], subscribeUser)
}

export function useAddresses() {
  return useAsync(() => listAddresses(), [], subscribeAddresses)
}

export function useAddAddress() {
  return useMutation(addAddress)
}

export function useUpdateAddress() {
  return useMutation((id: string, input: Partial<AddressInput>) => updateAddress(id, input))
}

/** Rejects with AddressInUseError (from lib/api) while a pending/confirmed booking uses the address. */
export function useDeleteAddress() {
  return useMutation((id: string) => deleteAddress(id))
}

export function useRequestOtp() {
  return useMutation((phone: string) => requestOtp(phone))
}

/** A verified code is the moment the session becomes signed-in, so this owns the app-state flip. */
export function useVerifyOtp() {
  const { signIn } = useAppState()
  return useMutation(async (phone: string, code: string) => {
    await verifyOtp(phone, code)
    signIn()
  })
}

export function useCompleteProfile() {
  return useMutation((input: CompleteProfileInput) => completeProfile(input))
}

export function useUpdateProfile() {
  return useMutation((input: UpdateProfileInput) => updateProfile(input))
}

/** Deleting the account ends the session too, so — like useVerifyOtp's signIn — this owns the app-state signOut. */
export function useDeleteAccount() {
  const { signOut } = useAppState()
  return useMutation(async () => {
    await deleteAccount()
    signOut()
  })
}
