import { useState } from 'react'
import { I18nManager, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import type { StylistServiceType } from '@/lib/data'
import { useAddAddress, useAddresses } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'
import { useGoBookingDraft } from './_layout'

export default function GoBookingAddressScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { stylistId, type } = useLocalSearchParams<{ stylistId: string; type: StylistServiceType }>()
  const { data: addresses } = useAddresses()
  const { mutate: addAddress } = useAddAddress()
  const { addressId, setAddressId, eventDate, setEventDate, eventNotes, setEventNotes } = useGoBookingDraft()
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft

  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newArea, setNewArea] = useState('')
  const [newDetails, setNewDetails] = useState('')

  const isEvents = type === 'events-bridal'
  const canContinue = !!addressId

  const saveNewAddress = async () => {
    if (!newArea.trim() || !newDetails.trim()) return
    try {
      const created = await addAddress({ label: newLabel.trim() || 'Address', area: newArea.trim(), details: newDetails.trim() })
      setAddressId(created.id)
      setShowAddForm(false)
      setNewLabel('')
      setNewArea('')
      setNewDetails('')
    } catch {
      // form stays open with the entered values so the user can retry
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
          className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <BackIcon size={18} color={colors.foreground} />
        </Pressable>
        <Text className="flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">{t('goBooking.addressStepTitle')}</Text>
        <View className="size-9" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-28 pt-5">
        <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">
          {t('goBooking.stepIndicator', { current: 2, total: 4 })}
        </Text>
        <Text className="font-serif text-xl font-semibold text-stone-900 dark:text-white">{t('goBooking.savedAddresses')}</Text>

        <View className="gap-3">
          {(addresses ?? []).map((address) => {
            const selected = addressId === address.id
            return (
              <Pressable
                key={address.id}
                onPress={() => setAddressId(address.id)}
                className={`rounded-xl border p-3 ${
                  selected ? 'border-stone-900 bg-stone-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                }`}
              >
                <Text className="font-semibold text-stone-900 dark:text-white">{address.label}</Text>
                <Text className="mt-0.5 text-sm text-stone-500 dark:text-zinc-400">
                  {address.area} · {address.details}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {showAddForm ? (
          <View className="gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <TextInput
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder={t('goBooking.addressLabelPlaceholder')}
              placeholderTextColor={colors.muted}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            <TextInput
              value={newArea}
              onChangeText={setNewArea}
              placeholder={t('goBooking.addressAreaPlaceholder')}
              placeholderTextColor={colors.muted}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            <TextInput
              value={newDetails}
              onChangeText={setNewDetails}
              placeholder={t('goBooking.addressDetailsPlaceholder')}
              placeholderTextColor={colors.muted}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            <Pressable onPress={saveNewAddress} className="items-center rounded-lg bg-stone-900 py-2.5 dark:bg-blue-600">
              <Text className="text-sm font-semibold text-white">{t('goBooking.saveAddress')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowAddForm(true)}
            className="flex-row items-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 py-3 dark:border-zinc-700"
          >
            <Plus size={16} color={colors.accent} />
            <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t('goBooking.addNewAddress')}</Text>
          </Pressable>
        )}

        {isEvents && (
          <View className="mt-4 gap-3">
            <View>
              <Text className="mb-1.5 text-sm font-medium text-stone-700 dark:text-zinc-200">{t('goBooking.eventDateLabel')}</Text>
              <TextInput
                value={eventDate}
                onChangeText={setEventDate}
                placeholder={t('goBooking.eventDatePlaceholder')}
                placeholderTextColor={colors.muted}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </View>
            <View>
              <Text className="mb-1.5 text-sm font-medium text-stone-700 dark:text-zinc-200">{t('goBooking.eventNotesLabel')}</Text>
              <TextInput
                value={eventNotes}
                onChangeText={setEventNotes}
                placeholder={t('goBooking.eventNotesPlaceholder')}
                placeholderTextColor={colors.muted}
                multiline
                className="min-h-20 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable
          disabled={!canContinue}
          onPress={() => router.push({ pathname: '/go-booking/datetime', params: { stylistId, type } })}
          className="items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-50"
        >
          <Text className="font-semibold text-white">{canContinue ? t('common.continue') : t('goBooking.noAddressYet')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
