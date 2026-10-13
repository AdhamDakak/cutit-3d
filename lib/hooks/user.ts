import {
  addAddress,
  completeProfile,
  deleteAccount,
  deleteAddress,
  getCurrentUser,
  listAddresses,
  logIn,
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

/** Resolves to `{ isNewUser }`. Doesn't sign in — that happens once the flow ends in logIn or completeProfile. */
export function useVerifyOtp() {
  return useMutation((phone: string, code: string) => verifyOtp(phone, code))
}

/** Logs a registered number back in and owns the app-state signIn (rejects with AccountNotFoundError otherwise). */
export function useLogIn() {
  const { signIn } = useAppState()
  return useMutation(async (phone: string) => {
    const user = await logIn(phone)
    signIn()
    return user
  })
}

/** Creates (registers) the account and owns the app-state signIn, the same way useLogIn does. */
export function useCompleteProfile() {
  const { signIn } = useAppState()
  return useMutation(async (input: CompleteProfileInput) => {
    const user = await completeProfile(input)
    signIn()
    return user
  })
}

export function useUpdateProfile() {
  return useMutation((input: UpdateProfileInput) => updateProfile(input))
}

/** Deleting the account ends the session too, so — like useVerifyOtp's signIn — this owns the app-state signOut. */
export function useDeleteAccount() {
  const { signOut } = useAppState()
  return useMutation(async (options?: { forfeitWalletBalance?: boolean }) => {
    await deleteAccount(options)
    signOut()
  })
}
