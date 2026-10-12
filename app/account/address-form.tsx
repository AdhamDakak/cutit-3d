import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { AddressForm } from '@/components/address-form'
import { StackHeader } from '@/components/stack-header'
import type { AddressInput } from '@/lib/api'
import { useAddAddress, useAddresses, useUpdateAddress } from '@/lib/hooks'

/** Add (no params) or edit (`id`) a saved address. */
export default function AddressFormScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const { data: addresses, isLoading } = useAddresses()
  const { mutate: addAddress, isPending: isAdding, error: addError } = useAddAddress()
  const { mutate: updateAddress, isPending: isUpdating, error: updateError } = useUpdateAddress()

  const existing = id ? addresses?.find((address) => address.id === id) : undefined
  const error = addError ?? updateError

  const save = async (input: AddressInput) => {
    try {
      if (id) await updateAddress(id, input)
      else await addAddress(input)
      router.back()
    } catch {
      // error below surfaces this; the form keeps its values
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t(id ? 'account.editAddressTitle' : 'account.addAddressTitle')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView className="flex-1" contentContainerClassName="gap-3 px-5 pb-10 pt-5" keyboardShouldPersistTaps="handled">
          {id && !existing ? (
            <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{isLoading ? t('common.loading') : t('account.addressNotFound')}</Text>
          ) : (
            // Keyed so the form's own state starts from the address once it has loaded.
            <AddressForm
              key={existing?.id ?? 'new'}
              initial={existing}
              submitLabel={t('account.save')}
              isPending={isAdding || isUpdating}
              showErrors
              onSubmit={save}
            />
          )}
          {error ? <Text className="text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
