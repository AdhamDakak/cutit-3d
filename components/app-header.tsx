import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronRight, MapPin, Menu, Moon, Sun, UserRound } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { CheckoutAuthSheet } from '@/components/checkout-auth-sheet'
import { Logo } from '@/components/logo'
import { NotificationBell } from '@/components/notification-bell'
import { useAppState } from '@/lib/app-state'
import { getInitials } from '@/lib/format'
import { useCurrentUser } from '@/lib/hooks'
import { tracking } from '@/lib/rtl'
import { useThemeColors } from '@/lib/theme'

export function AppHeader() {
  const { t } = useTranslation()
  const { isSignedIn, theme, toggleTheme } = useAppState()
  // Same source as Profile's avatar, so the two always match and both update after a name edit.
  const { data: user } = useCurrentUser()
  const [showSignup, setShowSignup] = useState(false)
  const initials = user ? getInitials(user) : ''
  const colors = useThemeColors()
  const router = useRouter()
  const isDark = theme === 'dark'

  return (
    <View className="border-b border-stone-200/70 bg-[#f7f5f1]/95 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/95">
      <View className="flex-row items-center justify-between">
        <Logo />
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={toggleTheme}
            accessibilityLabel={t('home.toggleDarkMode')}
            className="size-9 items-center justify-center rounded-full active:opacity-80 dark:bg-zinc-800"
          >
            {isDark ? <Sun size={16} color="#facc15" /> : <Moon size={16} color={colors.muted} />}
          </Pressable>
          <NotificationBell label={t('home.notifications')} iconColor={colors.muted} className="size-9 items-center justify-center rounded-full active:opacity-80" />
          <Pressable
            onPress={() => router.push('/menu')}
            accessibilityLabel={t('home.openMenu')}
            className="size-9 items-center justify-center rounded-full active:opacity-80"
          >
            <Menu size={16} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <View>
          <Text className={`text-[11px] font-medium uppercase ${tracking('tracking-[3px]')} text-stone-500 dark:text-zinc-500`}>{t('home.discoverIn')}</Text>
          <Pressable className="mt-1 flex-row items-center gap-1.5">
            <MapPin size={14} color={colors.foreground} />
            <Text className="text-sm font-semibold text-stone-900 dark:text-white">{t('home.cairoEgypt')}</Text>
            <ChevronRight size={14} color={colors.muted} />
          </Pressable>
        </View>
        <Pressable
          onPress={() => (isSignedIn ? router.navigate('/(tabs)/profile') : setShowSignup(true))}
          accessibilityRole="button"
          accessibilityLabel={t(isSignedIn ? 'home.openProfile' : 'home.createAccount')}
          className="size-10 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
        >
          {!isSignedIn ? (
            <Text className="text-sm font-semibold text-stone-900 dark:text-white">G</Text>
          ) : initials ? (
            <Text className="text-sm font-semibold text-stone-900 dark:text-white">{initials}</Text>
          ) : (
            <UserRound size={18} color={colors.foreground} />
          )}
        </Pressable>
      </View>

      {/* Guest sign-up stays on the current screen; the avatar re-renders with the new initials on success. */}
      <CheckoutAuthSheet mode="signup" visible={showSignup} onClose={() => setShowSignup(false)} onAuthenticated={() => setShowSignup(false)} />
    </View>
  )
}
