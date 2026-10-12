import { useMemo, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CheckCircle2, MessageCircle } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { PhotoStrip } from '@/components/photo-strip'
import { SettingRow } from '@/components/settings-rows'
import { StackHeader } from '@/components/stack-header'
import { usePhotoPicker } from '@/components/usePhotoPicker'
import { getBookingDetails, MIN_TICKET_DESCRIPTION } from '@/lib/api'
import type { SupportCategory, SupportTicket } from '@/lib/data'
import { useAddresses, useBookings, useCreateSupportTicket, useSupportTicket } from '@/lib/hooks'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

const CATEGORIES: SupportCategory[] = ['late-no-show', 'service-quality', 'wrong-charge', 'venue-behavior', 'other']
const MAX_PHOTOS = 3

export default function ReportIssueScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  // `ticketId` reopens an existing ticket's confirmation (linked from the inbox's "Issue reported" item).
  const { bookingId: bookingIdParam, ticketId } = useLocalSearchParams<{ bookingId?: string; ticketId?: string }>()
  const { data: existingTicket, isLoading: ticketLoading } = useSupportTicket(ticketId)
  const { data: bookings, isLoading: bookingsLoading } = useBookings()
  const { data: addresses } = useAddresses()
  const { mutate: createTicket, isPending, error } = useCreateSupportTicket()
  const { photos, openPicker, removePhoto } = usePhotoPicker(MAX_PHOTOS)

  const [bookingId, setBookingId] = useState<string | null>(bookingIdParam ?? null)
  const [category, setCategory] = useState<SupportCategory | null>(null)
  const [description, setDescription] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)

  const sortedBookings = useMemo(
    () => [...(bookings ?? [])].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [bookings],
  )

  const descriptionValid = description.trim().length >= MIN_TICKET_DESCRIPTION
  const canSubmit = !!bookingId && !!category && descriptionValid

  const submit = async () => {
    setAttempted(true)
    if (!canSubmit || isPending) return
    try {
      setTicket(await createTicket({ bookingId, category, description, photoUris: photos }))
    } catch {
      // error below surfaces this; everything entered stays for a retry
    }
  }

  const shownTicket = ticket ?? existingTicket
  if (ticketId && !shownTicket && ticketLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
        <StackHeader title={t('support.reportTitle')} />
        <Text className="mt-10 text-center text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
      </SafeAreaView>
    )
  }

  if (shownTicket) {
    return (
      <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
        <StackHeader title={t('support.reportTitle')} />
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <View className="size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 size={36} color="#059669" />
          </View>
          <Text className="text-center font-serif text-2xl font-semibold text-stone-900 dark:text-white">{t('support.sentTitle')}</Text>
          <Text className="text-center text-sm leading-6 text-stone-500 dark:text-zinc-400">{t('support.sentBody')}</Text>
          <View className="mt-2 rounded-xl border border-stone-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <Text className="text-center text-xs text-stone-500 dark:text-zinc-400">{t('support.ticketNumber')}</Text>
            <Text className="mt-1 text-center text-lg font-bold text-stone-900 dark:text-white" style={{ writingDirection: 'ltr' }}>
              {shownTicket.number}
            </Text>
          </View>
        </View>
        <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Pressable onPress={() => router.back()} className="items-center rounded-xl bg-blue-600 py-3.5">
            <Text className="font-semibold text-white">{t('common.done')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const chipClass = (active: boolean) =>
    `rounded-full border px-3.5 py-2 ${active ? 'border-stone-900 bg-stone-900 dark:border-blue-500 dark:bg-blue-600' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'}`
  const chipTextClass = (active: boolean) => `text-xs font-medium ${active ? 'text-white' : 'text-stone-600 dark:text-zinc-400'}`
  const sectionTitle = 'mb-2 font-semibold text-stone-900 dark:text-white'

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t('support.reportTitle')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pb-10 pt-5" keyboardShouldPersistTaps="handled">
          <View>
            <Text style={startAlign} className={sectionTitle}>
              {t('support.whichBooking')}
            </Text>
            {bookingsLoading && !bookings ? (
              <Text className="text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
            ) : sortedBookings.length === 0 ? (
              <View className="gap-3">
                <Text style={startAlign} className="text-sm text-stone-500 dark:text-zinc-400">
                  {t('support.noBookings')}
                </Text>
                <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <SettingRow icon={MessageCircle} label={t('help.chatSupport')} value={t('help.chatWithTeam')} onPress={() => router.push('/chat-support')} />
                </View>
              </View>
            ) : (
              <View className="gap-2">
                {sortedBookings.map((booking) => {
                  const details = getBookingDetails(booking, addresses ?? [])
                  const name = (booking.bookingType === 'salon' ? details.venue?.name : details.stylist?.name) ?? ''
                  const selected = bookingId === booking.id
                  return (
                    <Pressable
                      key={booking.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => setBookingId(booking.id)}
                      className={`rounded-xl border p-3 ${
                        selected ? 'border-stone-900 bg-stone-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                      }`}
                    >
                      <Text style={startAlign} className="font-semibold text-stone-900 dark:text-white">
                        {name}
                      </Text>
                      <Text style={startAlign} className="mt-0.5 text-sm text-stone-500 dark:text-zinc-400">
                        {details.dateLabel} · {details.timeLabel} · {t(`bookings.${booking.status}`)}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            )}
            {attempted && !bookingId && sortedBookings.length > 0 ? <Text className="mt-2 text-xs text-red-500">{t('support.pickBooking')}</Text> : null}
          </View>

          <View>
            <Text style={startAlign} className={sectionTitle}>
              {t('support.whatHappened')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} className={chipClass(category === item)}>
                  <Text className={chipTextClass(category === item)}>{t(`support.category.${item}`)}</Text>
                </Pressable>
              ))}
            </View>
            {attempted && !category ? <Text className="mt-2 text-xs text-red-500">{t('support.pickCategory')}</Text> : null}
          </View>

          <View>
            <Text style={startAlign} className={sectionTitle}>
              {t('support.describe')}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('support.describePlaceholder')}
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              className="min-h-28 rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            {attempted && !descriptionValid ? (
              <Text className="mt-2 text-xs text-red-500">{t('support.describeTooShort', { count: MIN_TICKET_DESCRIPTION })}</Text>
            ) : null}
          </View>

          <View>
            <Text style={startAlign} className="text-xs font-medium text-stone-500 dark:text-zinc-400">
              {t('support.photosHint', { count: MAX_PHOTOS })}
            </Text>
            <PhotoStrip photos={photos} max={MAX_PHOTOS} onAdd={openPicker} onRemove={removePhoto} />
          </View>
        </ScrollView>

        <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          {error ? <Text className="mb-2 text-xs text-red-500">{t('common.somethingWentWrong')}</Text> : null}
          <Pressable disabled={isPending || sortedBookings.length === 0} onPress={() => void submit()} className="items-center rounded-xl bg-blue-600 py-3.5 disabled:opacity-50">
            <Text className="font-semibold text-white">{t(isPending ? 'support.sending' : 'support.submit')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
