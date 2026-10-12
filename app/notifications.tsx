import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, type Href } from 'expo-router'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react-native'
import { BellOff, BellRing, CalendarCheck, CalendarClock, CalendarPlus, CalendarX2, Flag, Star, UserRound, WalletCards } from 'lucide-react-native'

import { CheckoutAuthSheet } from '@/components/checkout-auth-sheet'
import { ErrorState } from '@/components/error-state'
import { StackHeader } from '@/components/stack-header'
import { useAppState } from '@/lib/app-state'
import type { AppNotification, AppNotificationType } from '@/lib/data'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/lib/hooks'
import { startAlign } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

const TYPE_ICON: Record<AppNotificationType, LucideIcon> = {
  booking_pending: CalendarPlus,
  booking_confirmed: CalendarCheck,
  booking_cancelled: CalendarX2,
  booking_rescheduled: CalendarClock,
  reminder: BellRing,
  review_prompt: Star,
  ticket_created: Flag,
  wallet_topup: WalletCards,
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Where tapping an item goes. Bookings links carry the tab plus a fresh `at` so the tab re-selects every time. */
function destination(item: AppNotification): Href {
  const bookingsTab = (tab: 'past' | 'upcoming'): Href => ({ pathname: '/(tabs)/bookings', params: { tab, at: String(Date.now()) } })
  switch (item.type) {
    case 'booking_cancelled':
    case 'review_prompt':
      return bookingsTab('past')
    case 'ticket_created':
      return item.ticketId ? { pathname: '/support/report-issue', params: { ticketId: item.ticketId } } : '/help'
    case 'wallet_topup':
      return '/account/wallet'
    default:
      return bookingsTab('upcoming')
  }
}

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const colors = useThemeColors()
  const { isSignedIn } = useAppState()
  const { data: items, isLoading, error, refetch } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead()
  const [showSignup, setShowSignup] = useState(false)

  const list = items ?? []
  const hasUnread = list.some((item) => !item.readAt)
  // Text is built here, at display time, from the stored type + params — so old items follow a language switch.
  const lang = i18n.language
  const formatDate = (iso: string) => new Intl.DateTimeFormat(lang, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(iso))
  const formatTime = (iso: string) => new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso))

  const textFor = (item: AppNotification) => {
    const at = typeof item.params.at === 'string' ? item.params.at : null
    const values = { ...item.params, ...(at ? { date: formatDate(at), time: formatTime(at) } : null) }
    return { title: t(`notifications.items.${item.type}.title`), body: t(`notifications.items.${item.type}.body`, values) }
  }

  const relativeTime = (iso: string) => {
    const elapsed = Date.now() - new Date(iso).getTime()
    if (elapsed < MINUTE) return t('notifications.justNow')
    if (elapsed < HOUR) return t('notifications.minutesAgo', { n: Math.floor(elapsed / MINUTE) })
    if (elapsed < DAY) return t('notifications.hoursAgo', { n: Math.floor(elapsed / HOUR) })
    if (elapsed < 7 * DAY) return t('notifications.daysAgo', { n: Math.floor(elapsed / DAY) })
    return new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
  }

  const todayKey = new Date().toDateString()
  const sections = [
    { key: 'today', title: t('notifications.today'), data: list.filter((item) => new Date(item.createdAt).toDateString() === todayKey) },
    { key: 'earlier', title: t('notifications.earlier'), data: list.filter((item) => new Date(item.createdAt).toDateString() !== todayKey) },
  ].filter((section) => section.data.length > 0)

  const open = (item: AppNotification) => {
    if (!item.readAt) markRead(item.id).catch(() => {})
    const target = destination(item)
    // Tab destinations pop back to the tab navigator instead of stacking a second copy of it on top of this screen.
    if (typeof target === 'object' && target.pathname === '/(tabs)/bookings') router.dismissTo(target)
    else router.push(target)
  }

  const markAllAction =
    isSignedIn && hasUnread ? (
      <Pressable accessibilityRole="button" disabled={isMarkingAll} onPress={() => markAllRead().catch(() => {})} hitSlop={8}>
        <Text numberOfLines={2} className="text-end text-xs font-semibold text-blue-600 dark:text-blue-400">
          {t('notifications.markAll')}
        </Text>
      </Pressable>
    ) : undefined

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <StackHeader title={t('notifications.title')} action={markAllAction} />
      <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pb-10 pt-5">
        {!isSignedIn ? (
          <View className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <View className="size-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
              <UserRound size={22} color={colors.accent} />
            </View>
            <Text style={startAlign} className="mt-4 font-serif text-xl font-semibold text-stone-900 dark:text-white">
              {t('notifications.guest')}
            </Text>
            <Pressable onPress={() => setShowSignup(true)} className="mt-4 items-center rounded-xl bg-blue-600 py-3">
              <Text className="text-sm font-semibold text-white">{t('profile.guestCta')}</Text>
            </Pressable>
          </View>
        ) : !items && isLoading ? (
          <Text className="text-center text-sm text-stone-500 dark:text-zinc-400">{t('common.loading')}</Text>
        ) : !items && error ? (
          <ErrorState onRetry={refetch} />
        ) : list.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 dark:border-zinc-700 dark:bg-zinc-900/40">
            <View className="size-14 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
              <BellOff size={24} color={colors.muted} />
            </View>
            <Text className="mt-4 text-center font-serif text-xl font-semibold text-stone-900 dark:text-white">{t('notifications.emptyTitle')}</Text>
            <Text className="mt-2 text-center text-sm leading-6 text-stone-500 dark:text-zinc-400">{t('notifications.emptyBody')}</Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.key}>
              <Text style={startAlign} className="mb-2 px-1 text-xs font-semibold text-stone-500 dark:text-zinc-400">
                {section.title}
              </Text>
              <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                {section.data.map((item) => {
                  const Icon = TYPE_ICON[item.type]
                  const { title, body } = textFor(item)
                  const unread = !item.readAt
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${title}. ${body}`}
                      onPress={() => open(item)}
                      className={`flex-row gap-3 border-b border-stone-100 px-4 py-3.5 dark:border-zinc-800 ${unread ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                    >
                      <View className="size-9 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800">
                        <Icon size={16} color={colors.mutedStrong} />
                      </View>
                      <View className="min-w-0 flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text style={startAlign} numberOfLines={1} className={`flex-1 text-sm text-stone-900 dark:text-white ${unread ? 'font-semibold' : 'font-medium'}`}>
                            {title}
                          </Text>
                          <Text className="text-[11px] text-stone-400 dark:text-zinc-500">{relativeTime(item.createdAt)}</Text>
                          {unread ? <View accessibilityLabel={t('notifications.unread')} className="size-2 rounded-full bg-blue-600" /> : null}
                        </View>
                        <Text style={startAlign} className="mt-0.5 text-sm leading-5 text-stone-500 dark:text-zinc-400">
                          {body}
                        </Text>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <CheckoutAuthSheet mode="signup" visible={showSignup} onClose={() => setShowSignup(false)} onAuthenticated={() => setShowSignup(false)} />
    </SafeAreaView>
  )
}
