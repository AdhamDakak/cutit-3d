import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import {
  Bell,
  Check,
  CreditCard,
  FileText,
  Heart,
  HelpCircle,
  Home,
  Languages,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Pencil,
  Phone,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  UsersRound,
  WalletCards,
  MapPin,
} from 'lucide-react-native'

import { SettingRow, ToggleRow } from '@/components/settings-rows'
import { useAppState, type Gender } from '@/lib/app-state'
import { useThemeColors } from '@/lib/theme'

export default function ProfileScreen() {
  const { activeGender, setActiveGender, signOut } = useAppState()
  const { colorScheme, toggleColorScheme } = useColorScheme()
  const colors = useThemeColors()
  const router = useRouter()
  const isDark = colorScheme === 'dark'
  const [language, setLanguage] = useState('English')
  const [reminders, setReminders] = useState(true)
  const [offers, setOffers] = useState(false)

  const sectionClass = 'overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
  const labelClass = 'mb-2 px-1 text-[11px] font-medium uppercase tracking-[2.5px] text-stone-500 dark:text-zinc-400'

  const handleSignOut = () => {
    signOut()
    router.replace('/onboarding')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pb-10 pt-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-serif text-3xl font-semibold text-stone-900 dark:text-white">Profile</Text>
          <Pressable accessibilityLabel="Edit profile" className="size-9 items-center justify-center rounded-full bg-white dark:bg-zinc-800">
            <Pencil size={16} color={colors.muted} />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-4">
          <View accessibilityLabel="Amira Nabil initials" className="size-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60">
            <Text className="text-2xl font-semibold text-blue-700 dark:text-blue-200">AN</Text>
          </View>
          <View>
            <Text className="text-lg font-semibold text-stone-900 dark:text-white">Amira Nabil</Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Phone size={14} color={colors.muted} />
              <Text className="text-sm text-stone-500 dark:text-zinc-400">+20 100 123 4567</Text>
              <Check size={14} color="#3b82f6" />
            </View>
            <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">Member since 2024</Text>
          </View>
        </View>

        <View className="flex-row divide-x divide-stone-200 rounded-2xl border border-stone-200 bg-white py-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          <View className="flex-1 items-center">
            <Text className="text-lg font-semibold text-stone-900 dark:text-white">12</Text>
            <Text className="mt-1 text-[10px] text-stone-500 dark:text-zinc-400">Bookings</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-lg font-semibold text-stone-900 dark:text-white">2</Text>
            <Text className="mt-1 text-[10px] text-stone-500 dark:text-zinc-400">Addresses</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-lg font-semibold text-stone-900 dark:text-white">350</Text>
            <Text className="mt-1 text-[10px] text-stone-500 dark:text-zinc-400">Wallet · EGP</Text>
          </View>
        </View>

        <View>
          <Text className={labelClass}>Personal information</Text>
          <View className={sectionClass}>
            <SettingRow icon={UserRound} label="Full Name" value="Amira Nabil" />
            <SettingRow icon={Mail} label="Email Address" value="amira.nabil@email.com" />
            <View className="flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
              <View className="size-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800">
                <UsersRound size={16} color={colors.mutedStrong} />
              </View>
              <Text className="flex-1 text-sm font-medium text-stone-900 dark:text-white">Smart recommendations</Text>
              <View className="flex-row rounded-lg bg-stone-100 p-0.5 dark:bg-zinc-800">
                {(['For Her', 'For Him'] as Gender[]).map((item) => (
                  <Pressable key={item} onPress={() => setActiveGender(item)} className={`rounded-md px-2 py-1.5 ${activeGender === item ? 'bg-blue-600' : ''}`}>
                    <Text className={`text-[10px] font-semibold ${activeGender === item ? 'text-white' : 'text-stone-500 dark:text-zinc-400'}`}>
                      {item.replace('For ', '')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View>
          <Text className={labelClass}>Saved addresses</Text>
          <View className={sectionClass}>
            <SettingRow icon={Home} label="Home" value="New Cairo, 5th Settlement" />
            <SettingRow icon={MapPin} label="Work" value="Zamalek" />
            <Pressable className="flex-row items-center gap-2 px-4 py-3">
              <Plus size={16} color="#2563eb" />
              <Text className="text-sm font-semibold text-blue-600">Add New Address</Text>
            </Pressable>
          </View>
        </View>

        <View>
          <Text className={labelClass}>Payment & wallet</Text>
          <View className={sectionClass}>
            <View className="flex-row items-center gap-3 border-b border-stone-100 px-4 py-4 dark:border-zinc-800">
              <View className="size-9 items-center justify-center rounded-xl bg-blue-600">
                <WalletCards size={16} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-stone-900 dark:text-white">CUTIT Wallet</Text>
                <Text className="text-xs text-stone-500 dark:text-zinc-400">Available balance</Text>
              </View>
              <Text className="text-sm font-bold text-stone-900 dark:text-white">EGP 350</Text>
              <Pressable accessibilityLabel="Top up wallet" className="size-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                <Plus size={16} color="#2563eb" />
              </Pressable>
            </View>
            <SettingRow icon={CreditCard} label="Saved cards" value="Visa ending in 4242" />
            <SettingRow icon={WalletCards} label="Default payment" value="Card" />
          </View>
        </View>

        <View>
          <Text className={labelClass}>Preferences</Text>
          <View className={sectionClass}>
            <ToggleRow icon={isDark ? Moon : Sun} label="Appearance · Dark mode" checked={isDark} onChange={toggleColorScheme} />
            <View className="min-h-14 flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
              <Languages size={16} color={colors.mutedStrong} />
              <Text className="flex-1 text-sm font-medium text-stone-900 dark:text-white">Language</Text>
              <View className="flex-row rounded-lg bg-stone-100 p-0.5 dark:bg-zinc-800">
                {['English', 'العربية'].map((item) => (
                  <Pressable key={item} onPress={() => setLanguage(item)} className={`rounded-md px-2 py-1.5 ${language === item ? 'bg-blue-600' : ''}`}>
                    <Text className={`text-[10px] font-semibold ${language === item ? 'text-white' : 'text-stone-500 dark:text-zinc-400'}`}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <ToggleRow icon={Bell} label="Appointment reminders" checked={reminders} onChange={() => setReminders(!reminders)} />
            <ToggleRow icon={Sparkles} label="Exclusive offers" checked={offers} onChange={() => setOffers(!offers)} />
          </View>
        </View>

        <View>
          <Text className={labelClass}>Support & legal</Text>
          <View className={sectionClass}>
            <SettingRow
              icon={MessageCircle}
              label="In-App Chat Support"
              value="Chat with our team"
              onPress={() => router.push('/chat-support')}
            />
            <SettingRow icon={HelpCircle} label="FAQs" />
            <SettingRow icon={FileText} label="Report a booking issue" />
            <SettingRow icon={FileText} label="Terms of Service" />
            <SettingRow icon={FileText} label="Privacy Policy" />
          </View>
        </View>

        <View className="gap-3">
          <Pressable onPress={handleSignOut} className="min-h-12 flex-row items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-zinc-700">
            <LogOut size={16} color={colors.mutedStrong} />
            <Text className="text-sm font-semibold text-stone-800 dark:text-zinc-200">Log Out</Text>
          </Pressable>
          <Pressable className="flex-row items-center justify-center py-2">
            <Trash2 size={14} color="#ef4444" />
            <Text className="ml-1 text-xs text-red-500">Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
