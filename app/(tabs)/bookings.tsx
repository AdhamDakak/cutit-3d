import { useState } from 'react'
import { Image } from 'expo-image'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  Bell,
  CalendarDays,
  CalendarX2,
  Clock3,
  HelpCircle,
  MapPin,
  MessageCircle,
  PhoneCall,
} from 'lucide-react-native'

import { ReviewModal } from '@/components/review-modal'
import { establishments } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

type Tab = 'Upcoming' | 'Past History'

const upcoming = {
  name: 'The Grooming Society',
  district: 'New Cairo',
  image: establishments[0].image,
  stylist: 'Kareem',
  service: 'Haircut & Beard',
  total: 350,
}
const past = { name: 'Luma Beauty House', district: 'Zamalek', image: establishments[1].image, date: 'June 14, 2024', total: 650 }

export default function BookingsScreen() {
  const [tab, setTab] = useState<Tab>('Upcoming')
  const [reviewOpen, setReviewOpen] = useState(false)
  const colors = useThemeColors()
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top']}>
      <View className="border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[11px] font-medium uppercase tracking-[3px] text-stone-500 dark:text-zinc-500">Your visits</Text>
            <Text className="mt-1 font-serif text-2xl font-semibold text-stone-900 dark:text-white">My Bookings</Text>
          </View>
          <Pressable accessibilityLabel="Notifications" className="relative size-10 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <Bell size={16} color={colors.foreground} />
            <View className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-600" />
          </Pressable>
        </View>
        <View className="mt-5 flex-row rounded-xl bg-stone-200/70 p-1 dark:bg-zinc-900">
          {(['Upcoming', 'Past History'] as Tab[]).map((item) => (
            <Pressable key={item} onPress={() => setTab(item)} className={`flex-1 items-center rounded-lg py-2.5 ${tab === item ? 'bg-white dark:bg-zinc-800' : ''}`}>
              <Text className={`text-sm font-semibold ${tab === item ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-zinc-400'}`}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-10 pt-5">
        {tab === 'Upcoming' ? (
          <>
            <View className="flex-row items-center gap-3 rounded-2xl bg-blue-50 px-4 py-4 dark:bg-blue-950/50">
              <View className="size-10 items-center justify-center rounded-xl bg-blue-600">
                <Clock3 size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-blue-900 dark:text-blue-100">Your appointment is in 1 hour and 45 minutes</Text>
                <Text className="mt-1 text-xs text-blue-900/70 dark:text-blue-100/70">Today, 4:30 PM · Please arrive 10 minutes early</Text>
              </View>
            </View>

            <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <View className="flex-row gap-3 p-4">
                <Image source={{ uri: upcoming.image }} className="size-16 rounded-xl" contentFit="cover" />
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <View>
                      <Text numberOfLines={1} className="text-sm font-semibold text-stone-900 dark:text-white">{upcoming.name}</Text>
                      <View className="mt-1 self-start rounded-full bg-stone-100 px-2 py-1 dark:bg-zinc-800">
                        <Text className="text-[10px] text-stone-600 dark:text-zinc-300">{upcoming.district}</Text>
                      </View>
                    </View>
                    <View className="rounded-full bg-emerald-100 px-2 py-1">
                      <Text className="text-[10px] font-semibold text-emerald-700">Confirmed</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="mx-4 flex-row items-center gap-3 border-y border-stone-100 py-3 dark:border-zinc-800">
                <View className="size-9 items-center justify-center rounded-full bg-stone-200">
                  <Text className="text-xs font-semibold text-stone-700">KA</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-stone-900 dark:text-white">
                    {upcoming.stylist} <Text className="text-stone-500 dark:text-zinc-400">(Master Barber)</Text>
                  </Text>
                  <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                    {upcoming.service} · EGP {upcoming.total}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-row items-center gap-1.5">
                  <CalendarDays size={14} color={colors.foreground} />
                  <Text className="text-xs font-medium text-stone-900 dark:text-white">Today, 4:30 PM</Text>
                </View>
                <View className="rounded-full bg-stone-100 px-2 py-1 dark:bg-zinc-800">
                  <Text className="text-[10px] font-medium text-stone-600 dark:text-zinc-300">In-Salon</Text>
                </View>
              </View>
              <View className="gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
                <View className="flex-row gap-2">
                  <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-stone-200 py-2.5 dark:border-zinc-700">
                    <PhoneCall size={14} color={colors.mutedStrong} />
                    <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">Call Venue</Text>
                  </Pressable>
                  <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-stone-200 py-2.5 dark:border-zinc-700">
                    <MapPin size={14} color={colors.mutedStrong} />
                    <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">Get Directions</Text>
                  </Pressable>
                </View>
                <Pressable className="flex-row items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5">
                  <MessageCircle size={14} color="#ffffff" />
                  <Text className="text-xs font-semibold text-white">WhatsApp Support</Text>
                </Pressable>
                <Pressable className="flex-row items-center justify-center gap-1.5 py-1">
                  <HelpCircle size={14} color={colors.accent} />
                  <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">Need Help with this Booking?</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            <View className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <View className="flex-row gap-3 p-4">
                <Image source={{ uri: past.image }} className="size-16 rounded-xl" contentFit="cover" />
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <View>
                      <Text numberOfLines={1} className="text-sm font-semibold text-stone-900 dark:text-white">{past.name}</Text>
                      <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{past.district} · {past.date}</Text>
                    </View>
                    <View className="rounded-full bg-emerald-100 px-2 py-1">
                      <Text className="text-[10px] font-semibold text-emerald-700">Completed</Text>
                    </View>
                  </View>
                  <Text className="mt-3 text-sm font-semibold text-stone-900 dark:text-white">Total paid · EGP {past.total}</Text>
                </View>
              </View>
              <View className="flex-row gap-2 border-t border-stone-100 p-4 dark:border-zinc-800">
                <Pressable onPress={() => router.push('/(tabs)/explore')} className="flex-1 items-center rounded-xl bg-stone-900 py-2.5 dark:bg-blue-600">
                  <Text className="text-xs font-semibold text-white">Rebook in 1-Tap</Text>
                </Pressable>
                <Pressable onPress={() => setReviewOpen(true)} className="flex-1 items-center rounded-xl border border-stone-200 py-2.5 dark:border-zinc-700">
                  <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">Leave a Review</Text>
                </Pressable>
              </View>
            </View>

            <View className="flex-row gap-3 overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <View className="size-16 items-center justify-center rounded-xl bg-stone-100 dark:bg-zinc-800">
                <CalendarX2 size={24} color={colors.muted} />
              </View>
              <View>
                <Text className="text-sm font-semibold text-stone-900 dark:text-white">Maven Studio</Text>
                <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">Maadi · May 02, 2024</Text>
                <View className="mt-3 self-start rounded-full bg-stone-200 px-2 py-1">
                  <Text className="text-[10px] font-semibold text-stone-600">Cancelled</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <ReviewModal
        visible={reviewOpen}
        title="How was your visit?"
        subtitle={past.name}
        onClose={() => setReviewOpen(false)}
        onSubmit={() => {}}
      />
    </SafeAreaView>
  )
}
