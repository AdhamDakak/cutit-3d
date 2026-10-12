import { Platform } from 'react-native'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'

import { recordReminder } from '@/lib/api/notifications'
import i18n from '@/lib/i18n'

// Local reminders only — server push arrives with the backend. Every call here swallows errors (web has no local
// notifications, and a reminder failing must never fail the booking mutation that triggered it).

const REMINDER_CHANNEL_ID = 'reminders'
const REMINDER_LEAD_MS = 60 * 60 * 1000

// Show reminders as banners even while the app is open.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  })
}

// Mirrors the persisted "Appointment reminders" preference, which app-state owns and pushes in here.
let remindersEnabled = true

export function setReminderPreference(enabled: boolean) {
  remindersEnabled = enabled
}

export function areRemindersEnabled() {
  return remindersEnabled
}

/** Requests notification permission only if the user hasn't answered yet; resolves to whether it's granted. */
async function ensurePermission(prompt: boolean): Promise<boolean> {
  if (Platform.OS === 'android') {
    // Android 13+ only shows the permission prompt once a channel exists.
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: i18n.t('notifications.channelName'),
      importance: Notifications.AndroidImportance.HIGH,
    })
  }
  const current = await Notifications.getPermissionsAsync()
  if (current.granted || !prompt || !current.canAskAgain) return current.granted
  return (await Notifications.requestPermissionsAsync()).granted
}

/**
 * Schedules "Your appointment at {name} is in 1 hour" for `startTime`, returning the notification id — or null when
 * reminders are off, permission isn't granted, or the reminder time has already passed.
 */
export async function scheduleBookingReminder(
  { bookingId, name, startTime }: { bookingId: string; name: string; startTime: string },
  { prompt }: { prompt: boolean },
): Promise<string | null> {
  if (!remindersEnabled) return null
  try {
    const fireAt = new Date(startTime).getTime() - REMINDER_LEAD_MS
    if (!(await ensurePermission(prompt)) || fireAt <= Date.now()) return null
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.reminderTitle'),
        body: i18n.t('notifications.reminderBody', { name }),
        // `path` drives in-app routing (reminderPath); `url` is the same target as a deep link — cutit://bookings in
        // builds, Expo Go's own scheme in development. bookingId/name/startTime let the inbox record it (inboxReminder).
        data: { path: '/bookings', url: Linking.createURL('/bookings'), bookingId, name, startTime },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt, channelId: REMINDER_CHANNEL_ID },
    })
  } catch {
    return null
  }
}

/**
 * The in-app path a tapped reminder points at ('/bookings'), so navigation stays in-app rather than a round trip
 * through the OS. Read from the reminder's `path`, falling back to parsing its `url` for reminders scheduled before
 * `path` existed — note a custom-scheme URL's first segment parses as the *hostname* (cutit://bookings →
 * hostname 'bookings', path null), so both are joined. Null for anything that isn't a Cutit reminder.
 */
export function reminderPath(response: Notifications.NotificationResponse | null): string | null {
  const data = response?.notification.request.content.data
  if (typeof data?.path === 'string') return data.path
  if (typeof data?.url !== 'string') return null
  const { hostname, path } = Linking.parse(data.url)
  const joined = [hostname, path].filter(Boolean).join('/').replace(/^\/+/, '')
  return joined ? `/${joined}` : null
}

/**
 * Mirrors a reminder into the in-app inbox: unread when it's delivered while the app is open, read when it's tapped
 * (created already-read if it arrived while the app was closed). Ignores anything that isn't a Cutit reminder.
 */
export function inboxReminder(notification: Notifications.Notification | undefined, { read }: { read: boolean }) {
  const data = notification?.request.content.data
  if (typeof data?.bookingId !== 'string' || typeof data.startTime !== 'string') return
  recordReminder({ bookingId: data.bookingId, name: typeof data.name === 'string' ? data.name : '', at: data.startTime }, { read }).catch(() => {})
}

/** The reminder whose tap cold-launched the app, if any. Read-only — call clearLaunchReminder() once it's handled. */
export function getLaunchReminderPath(): string | null {
  return reminderPath(getLaunchResponse())
}

function getLaunchResponse(): Notifications.NotificationResponse | null {
  if (Platform.OS === 'web') return null
  try {
    return Notifications.getLastNotificationResponse()
  } catch {
    return null
  }
}

/** Marks the cold-launching reminder read in the inbox, then forgets it so it isn't handled twice. */
export function clearLaunchReminder() {
  if (Platform.OS === 'web') return
  inboxReminder(getLaunchResponse()?.notification, { read: true })
  try {
    Notifications.clearLastNotificationResponse()
  } catch {}
}

export async function cancelReminder(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  } catch {}
}

export async function cancelAllReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
  } catch {}
}
