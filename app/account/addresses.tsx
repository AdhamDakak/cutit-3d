import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MapPin, Plus, Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { addressIcon, addressLabelText } from '@/components/address-form'
import { ErrorState } from '@/components/error-state'
import { StackHeader } from '@/components/stack-header'
import { AddressInUseError } from '@/lib/api'
import type { Address } from '@/lib/data'
import { useAddresses, useDeleteAddress } from '@/lib/hooks'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

export default function AddressesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { data: addresses, isLoading, error, refetch } = useAddresses()
  const { mutate: deleteAddress } = useDeleteAddress()

  const confirmDelete = (address: Address) => {
    Alert.alert(t('account.deleteAddressTitle'), t('account.deleteAddressBody', { label: addressLabelText(address.label, t) }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('account.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(address.id)
          } catch (err) {
            Alert.alert(t(err instanceof AddressInUseError ? 'account.addressInUse' : 'common.somethingWentWrong'))
          }
        },
      },
    ])
  }

  const list = addresses ?? []

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t('account.addressesTitle')} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-10 pt-5">
        {isLoading && !addresses ? (
          <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
        ) : error && !addresses ? (
          <ErrorState onRetry={refetch} />
        ) : list.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 dark:border-zinc-700 dark:bg-zinc-900/40">
            <View className="size-14 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
              <MapPin size={24} color={colors.muted} />
            </View>
            <Text className="mt-4 font-serif text-xl font-semibold text-stone-900 dark:text-white">{t('account.noAddressesTitle')}</Text>
            <Text className="mt-2 text-center text-sm leading-6 text-stone-500 dark:text-zinc-400">{t('account.noAddressesBody')}</Text>
          </View>
        ) : (
          <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {list.map((address) => {
              const Icon = addressIcon(address.label)
              return (
                <View key={address.id} className="min-h-16 flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/account/address-form', params: { id: address.id } })}
                    className="min-w-0 flex-1 flex-row items-center gap-3"
                  >
                    <View className="size-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800">
                      <Icon size={16} color={colors.mutedStrong} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text style={startAlign} className="text-sm font-medium text-stone-900 dark:text-white">
                        {addressLabelText(address.label, t)}
                      </Text>
                      <Text style={startAlign} numberOfLines={1} className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
                        {address.area} · {address.details}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={t('account.deleteAddress')}
                    onPress={() => confirmDelete(address)}
                    hitSlop={8}
                    className="size-8 items-center justify-center rounded-full"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </Pressable>
                </View>
              )
            })}
          </View>
        )}

        <Pressable
          onPress={() => router.push('/account/address-form')}
          className="flex-row items-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 py-3 dark:border-zinc-700"
        >
          <Plus size={16} color={colors.accent} />
          <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t('profile.addNewAddress')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
