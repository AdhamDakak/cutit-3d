import { Platform } from 'react-native'
import { getCalendars, getDefaultCalendarSync, requestCalendarPermissions, type ExpoCalendar } from 'expo-calendar'

export type CalendarEventInput = {
  title: string
  startDate: Date
  endDate: Date
  location?: string
  notes?: string
}

export type AddToCalendarResult = 'added' | 'denied' | 'failed'

// Android has no system default calendar, so take the first writable one, preferring an account's primary.
async function pickCalendar(): Promise<ExpoCalendar | undefined> {
  if (Platform.OS === 'ios') return getDefaultCalendarSync()
  const writable = (await getCalendars()).filter((calendar) => calendar.allowsModifications)
  return writable.find((calendar) => calendar.isPrimary) ?? writable[0]
}

// Asks for calendar access on demand, then writes the event. Never throws: Expo Go and web have no native
// calendar module, so those land on 'failed' like any other error.
export async function addToCalendar(event: CalendarEventInput): Promise<AddToCalendarResult> {
  try {
    const { granted } = await requestCalendarPermissions()
    if (!granted) return 'denied'
    const calendar = await pickCalendar()
    if (!calendar) return 'failed'
    await calendar.createEvent({ ...event, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
    return 'added'
  } catch {
    return 'failed'
  }
}
