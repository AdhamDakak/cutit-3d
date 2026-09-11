import { useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Heart, Image as ImageIcon, MapPin, Search, Star, UserRound } from 'lucide-react-native'

import { ReviewModal } from '@/components/review-modal'
import { establishments, timeSlots } from '@/lib/data'
import { useThemeColors } from '@/lib/theme'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const establishment = establishments.find((item) => item.id === Number(id))
  const router = useRouter()
  const colors = useThemeColors()

  const [selectedStaff, setSelectedStaff] = useState<number | null>(null)
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set())
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [serviceQuery, setServiceQuery] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)

  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      return date
    })
  }, [])
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!establishment) return <Redirect href="/(tabs)" />

  const totalPrice = Array.from(selectedServices).reduce((sum, idx) => sum + (establishment.serviceList[idx]?.price ?? 0), 0)
  const filteredServices = establishment.serviceList.filter((service) => service.name.toLowerCase().includes(serviceQuery.toLowerCase()))
  const canConfirm = selectedServices.size > 0 && !!selectedTime

  const confirmBooking = () => {
    Alert.alert('Booking confirmed', `${establishment.name} · ${dayNames[dates[selectedDate].getDay()]} at ${selectedTime}`, [
      { text: 'OK', onPress: () => router.replace('/(tabs)/bookings') },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f1] dark:bg-zinc-950" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800">
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text numberOfLines={1} className="mx-3 flex-1 text-center font-serif text-lg font-semibold text-stone-900 dark:text-white">
          {establishment.name}
        </Text>
        <Pressable accessibilityLabel="Save venue" className="size-9 items-center justify-center rounded-full border border-stone-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800">
          <Heart size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-28">
        {establishment.image ? (
          <Image source={{ uri: establishment.image }} className="h-64 w-full" contentFit="cover" />
        ) : (
          <View className="h-64 w-full items-center justify-center border border-stone-200 bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900">
            <ImageIcon size={32} color={colors.muted} />
            <Text className="mt-2 text-xs text-stone-500 dark:text-zinc-400">No photo yet</Text>
          </View>
        )}

        <View className="px-5 py-6">
          <View className="flex-row items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <View>
              <Text className="font-serif text-2xl font-semibold text-stone-900 dark:text-white">{establishment.name}</Text>
              <View className="mt-2 flex-row items-center gap-1.5">
                <MapPin size={16} color={colors.muted} />
                <Text className="text-stone-500 dark:text-zinc-400">{establishment.district}</Text>
              </View>
              <View className="mt-3 flex-row items-center gap-1">
                <Star size={16} color={colors.amber} fill={colors.amber} />
                <Text className="font-semibold text-stone-900 dark:text-white">{establishment.rating}</Text>
                <Text className="text-stone-500 dark:text-zinc-400">({establishment.reviews} reviews)</Text>
              </View>
            </View>
          </View>

          <View className="mt-8">
            <Text className="mb-4 font-semibold text-stone-900 dark:text-white">Select a Stylist</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {establishment.staff.map((person) => {
                  const active = selectedStaff === person.id
                  return (
                    <Pressable
                      key={person.id}
                      onPress={() => setSelectedStaff(person.id)}
                      className={`items-center gap-2 rounded-lg px-3 py-2 ${active ? 'bg-stone-900 dark:bg-blue-600' : 'bg-stone-100 dark:bg-zinc-800'}`}
                    >
                      {person.photo ? (
                        <Image source={{ uri: person.photo }} className="size-10 rounded-full" />
                      ) : (
                        <View className="size-10 items-center justify-center rounded-full bg-stone-300 dark:bg-zinc-600">
                          <UserRound size={18} color={colors.mutedStrong} />
                        </View>
                      )}
                      <View className="items-center">
                        <Text className={`text-xs ${active ? 'text-white' : 'text-stone-900 dark:text-white'}`}>{person.name}</Text>
                        <Text className={`text-[10px] ${active ? 'text-white/80' : 'text-stone-500 dark:text-zinc-400'}`}>{person.role}</Text>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </ScrollView>
          </View>

          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between gap-3">
              <Text className="font-semibold text-stone-900 dark:text-white">Select Services</Text>
              <Text className="text-xs text-stone-500 dark:text-zinc-400">{establishment.serviceList.length} options</Text>
            </View>
            <View className="mb-3 flex-row items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900">
              <Search size={16} color={colors.muted} />
              <TextInput
                value={serviceQuery}
                onChangeText={setServiceQuery}
                placeholder="Search services"
                placeholderTextColor={colors.muted}
                className="min-w-0 flex-1 text-sm text-stone-900 dark:text-white"
              />
            </View>
            <View className="gap-3">
              {filteredServices.map((service) => {
                const idx = establishment.serviceList.indexOf(service)
                const selected = selectedServices.has(idx)
                return (
                  <Pressable
                    key={service.name}
                    onPress={() => {
                      const next = new Set(selectedServices)
                      if (next.has(idx)) next.delete(idx)
                      else next.add(idx)
                      setSelectedServices(next)
                    }}
                    className={`flex-row items-start gap-3 rounded-lg border p-3 ${
                      selected ? 'border-stone-900 bg-stone-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                    }`}
                  >
                    <View
                      className={`mt-1 size-4 items-center justify-center rounded border ${
                        selected ? 'border-blue-600 bg-blue-600' : 'border-stone-300 bg-white dark:border-zinc-600'
                      }`}
                    >
                      {selected && <View className="size-2 rounded-sm bg-white" />}
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-stone-900 dark:text-white">{service.name}</Text>
                      <Text className="text-sm text-stone-500 dark:text-zinc-400">{service.duration} min</Text>
                    </View>
                    <Text className="shrink-0 font-semibold text-stone-900 dark:text-white">EGP {service.price}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <View className="mt-8">
            <Text className="mb-4 font-semibold text-stone-900 dark:text-white">Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {dates.map((date, idx) => {
                  const active = selectedDate === idx
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => setSelectedDate(idx)}
                      className={`items-center rounded-lg px-4 py-3 ${active ? 'bg-stone-900 dark:bg-blue-600' : 'border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'}`}
                    >
                      <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-stone-500 dark:text-zinc-400'}`}>{dayNames[date.getDay()]}</Text>
                      <Text className={`text-lg font-bold ${active ? 'text-white' : 'text-stone-900 dark:text-white'}`}>{date.getDate()}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </ScrollView>
          </View>

          <View className="mt-8 gap-4">
            <Text className="font-semibold text-stone-900 dark:text-white">Select Time</Text>
            {(['Morning', 'Afternoon', 'Evening'] as const).map((period) => (
              <View key={period}>
                <Text className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-zinc-400">{period}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {timeSlots
                    .filter((slot) => slot.period === period)
                    .map((slot) => {
                      const active = selectedTime === slot.time
                      return (
                        <Pressable
                          key={slot.time}
                          onPress={() => setSelectedTime(slot.time)}
                          className={`min-w-[70px] items-center rounded-lg border py-2 ${
                            active ? 'border-transparent bg-stone-900 dark:bg-blue-600' : 'border-stone-200 bg-white dark:border-transparent dark:bg-zinc-800'
                          }`}
                        >
                          <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-stone-900 dark:text-zinc-100'}`}>{slot.time}</Text>
                        </Pressable>
                      )
                    })}
                </View>
              </View>
            ))}
          </View>

          <View className="mt-10 border-t border-stone-200/70 pt-6 dark:border-zinc-800">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold text-stone-900 dark:text-white">Customer reviews</Text>
                <Text className="mt-1 text-xs text-stone-500 dark:text-zinc-400">What guests say about this venue</Text>
              </View>
              <Pressable onPress={() => setReviewOpen(true)} className="rounded-xl bg-blue-600 px-3 py-2">
                <Text className="text-xs font-semibold text-white">Write a Review</Text>
              </Pressable>
            </View>
            <View className="mt-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <View className="flex-row items-center gap-2">
                <Star size={16} color={colors.amber} fill={colors.amber} />
                <Text className="font-semibold text-stone-900 dark:text-white">{establishment.rating}</Text>
                <Text className="text-xs text-stone-500 dark:text-zinc-400">from {establishment.reviews} reviews</Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              {establishment.reviewList.map((review) => (
                <View key={review.id} className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="size-8 items-center justify-center rounded-full bg-stone-200 dark:bg-zinc-700">
                        <Text className="text-xs font-semibold text-stone-700 dark:text-zinc-200">{getInitials(review.author)}</Text>
                      </View>
                      <Text className="text-sm font-medium text-stone-900 dark:text-white">{review.author}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Star size={12} color={colors.amber} fill={colors.amber} />
                      <Text className="text-xs font-semibold text-stone-900 dark:text-white">{review.rating}</Text>
                    </View>
                  </View>
                  <Text className="mt-2 text-sm leading-5 text-stone-600 dark:text-zinc-300">{review.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs uppercase tracking-widest text-stone-500 dark:text-zinc-400">Total</Text>
            <Text className="text-2xl font-bold text-stone-900 dark:text-white">EGP {totalPrice}</Text>
          </View>
          <Pressable disabled={!canConfirm} onPress={confirmBooking} className="rounded-xl bg-blue-600 px-6 py-3 disabled:opacity-50">
            <Text className="font-semibold text-white">Confirm Booking</Text>
          </Pressable>
        </View>
      </View>

      <ReviewModal
        visible={reviewOpen}
        title="Write a Review"
        onClose={() => setReviewOpen(false)}
        onSubmit={() => {}}
      />
    </SafeAreaView>
  )
}
