import { useState } from 'react'
import { Modal, Pressable, Text, TextInput, View } from 'react-native'
import { Star, X } from 'lucide-react-native'

import { useThemeColors } from '@/lib/theme'

export function ReviewModal({
  visible,
  title,
  subtitle,
  requireText = false,
  onClose,
  onSubmit,
}: {
  visible: boolean
  title: string
  subtitle?: string
  requireText?: boolean
  onClose: () => void
  onSubmit: (rating: number, text: string) => void
}) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const colors = useThemeColors()

  const canSubmit = rating > 0 && (!requireText || text.trim().length > 0)

  const handleClose = () => {
    setRating(0)
    setText('')
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/40 p-4">
        <View className="w-full rounded-2xl bg-white p-5 dark:bg-zinc-900">
          <View className="flex-row items-center justify-between">
            <Text className="font-serif text-xl font-semibold text-stone-900 dark:text-white">{title}</Text>
            <Pressable accessibilityLabel="Close review" onPress={handleClose}>
              <X size={18} color={colors.muted} />
            </Pressable>
          </View>
          {subtitle && <Text className="mt-1 text-sm text-stone-500 dark:text-zinc-400">{subtitle}</Text>}

          <View className="flex-row justify-center gap-2 py-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <Pressable key={item} onPress={() => setRating(item)} accessibilityLabel={`${item} stars`}>
                <Star size={32} color={colors.amber} fill={item <= rating ? colors.amber : 'transparent'} />
              </Pressable>
            ))}
          </View>

          {requireText && (
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Tell us about your visit"
              placeholderTextColor={colors.muted}
              multiline
              className="min-h-24 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          )}

          <Pressable
            disabled={!canSubmit}
            onPress={() => {
              onSubmit(rating, text)
              handleClose()
            }}
            className="mt-3 items-center rounded-xl bg-stone-900 py-3 disabled:opacity-40 dark:bg-blue-600"
          >
            <Text className="text-sm font-semibold text-white">Submit Review</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
