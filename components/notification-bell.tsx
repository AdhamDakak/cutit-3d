import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Bell } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useAppState } from '@/lib/app-state'
import { useUnreadNotificationCount } from '@/lib/hooks'

/**
 * A bell that opens the in-app inbox, with an unread badge (hidden at 0 and for guests, "9+" above 9). Used by both
 * the Home header and the Bookings header, which style the button itself differently.
 */
export function NotificationBell({ className, iconColor, label }: { className: string; iconColor: string; label: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { isSignedIn } = useAppState()
  const { data: count } = useUnreadNotificationCount()
  const unread = isSignedIn ? (count ?? 0) : 0

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `${label}, ${t('notifications.unreadLabel', { n: unread })}` : label}
      className={`relative ${className}`}
    >
      <Bell size={16} color={iconColor} />
      {unread > 0 ? (
        <View className="absolute -end-0.5 -top-0.5 h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1">
          <Text className="text-[9px] font-bold text-white">{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}
