import { useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { ChevronDown, X } from 'lucide-react-native'

import { useThemeColors } from '@/lib/theme'

export type CountryCode = { name: string; code: string; flag: string }

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
  { name: 'Qatar', code: '+974', flag: '🇶🇦' },
  { name: 'Bahrain', code: '+973', flag: '🇧🇭' },
  { name: 'Oman', code: '+968', flag: '🇴🇲' },
  { name: 'Jordan', code: '+962', flag: '🇯🇴' },
  { name: 'Lebanon', code: '+961', flag: '🇱🇧' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
]

export function CountryCodePicker({ value, onChange }: { value: CountryCode; onChange: (country: CountryCode) => void }) {
  const [open, setOpen] = useState(false)
  const colors = useThemeColors()

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Choose country code"
        className="flex-row items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <Text className="text-sm text-stone-900 dark:text-white">
          {value.flag} {value.code}
        </Text>
        <ChevronDown size={14} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/40 p-4">
          <View className="max-h-[70%] w-full rounded-2xl bg-white p-5 dark:bg-zinc-900">
            <View className="flex-row items-center justify-between">
              <Text className="font-serif text-xl font-semibold text-stone-900 dark:text-white">Country code</Text>
              <Pressable accessibilityLabel="Close" onPress={() => setOpen(false)}>
                <X size={18} color={colors.muted} />
              </Pressable>
            </View>
            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              {COUNTRY_CODES.map((country) => {
                const selected = value.code === country.code && value.name === country.name
                return (
                  <Pressable
                    key={`${country.code}-${country.name}`}
                    onPress={() => {
                      onChange(country)
                      setOpen(false)
                    }}
                    className={`flex-row items-center justify-between rounded-xl px-3 py-3 ${selected ? 'bg-stone-100 dark:bg-zinc-800' : ''}`}
                  >
                    <Text className="text-sm text-stone-900 dark:text-white">
                      {country.flag}  {country.name}
                    </Text>
                    <Text className="text-sm text-stone-500 dark:text-zinc-400">{country.code}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}
