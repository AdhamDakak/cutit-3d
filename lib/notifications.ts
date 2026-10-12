import { Platform } from 'react-native'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'

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
  { name, startTime }: { name: string; startTime: string },
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
        // createURL resolves to cutit://bookings in builds (and Expo Go's own scheme in development).
        data: { url: Linking.createURL('/bookings') },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt, channelId: REMINDER_CHANNEL_ID },
    })
  } catch {
    return null
  }
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
