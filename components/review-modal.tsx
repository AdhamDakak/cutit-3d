import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { Plus, Star, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useSheetDismissGesture } from '@/components/useSheetDismissGesture'
import { useCreateReview } from '@/lib/hooks'
import { useThemeColors } from '@/lib/theme'

export type ReviewTarget = {
  kind: 'venue' | 'stylist'
  id: string
  bookingId: string
}

const MAX_PHOTOS = 5
// expo-image-picker has no direct "max dimension" option — quality is its own
// long-edge/compression knob, which is what the mock uses to stand in for a
// real resize-to-1600px pass (a future upload step would do that for real).
const PHOTO_QUALITY = 0.7

export function ReviewModal({
  visible,
  target,
  title,
  subtitle,
  onClose,
}: {
  visible: boolean
  target: ReviewTarget | null
  title: string
  subtitle?: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const { mutate: createReview, isPending, error } = useCreateReview()

  const canSubmit = rating > 0 && !isPending

  const handleClose = () => {
    setRating(0)
    setText('')
    setPhotos([])
    onClose()
  }

  const { panGesture, animatedStyle } = useSheetDismissGesture(visible, handleClose)

  const addPhotos = (uris: string[]) => {
    setPhotos((prev) => [...prev, ...uris].slice(0, MAX_PHOTOS))
  }

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) return
    const result = await ImagePicker.launchCameraAsync({ quality: PHOTO_QUALITY })
    if (!result.canceled) addPhotos(result.assets.map((asset) => asset.uri))
  }

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: PHOTO_QUALITY,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
    })
    if (!result.canceled) addPhotos(result.assets.map((asset) => asset.uri))
  }

  const openPicker = () => {
    Alert.alert(t('review.addPhotos'), undefined, [
      { text: t('review.takePhoto'), onPress: () => void pickFromCamera() },
      { text: t('review.chooseFromLibrary'), onPress: () => void pickFromLibrary() },
      { text: t('common.cancel'), style: 'cancel' },
    ])
  }

  const handleSubmit = async () => {
    if (!target || rating === 0) return
    try {
      await createReview({
        bookingId: target.bookingId,
        venueId: target.kind === 'venue' ? target.id : null,
        stylistId: target.kind === 'stylist' ? target.id : undefined,
        rating,
        text: text.trim() || undefined,
        photoUris: photos,
      })
      handleClose()
    } catch {
      // error below already surfaces this
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="flex-1 justify-end bg-black/40 p-4">
            <Animated.View style={animatedStyle}>
              <View className="w-full rounded-2xl bg-white p-5 dark:bg-zinc-900">
                <GestureDetector gesture={panGesture}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-serif text-xl font-semibold text-stone-900 dark:text-white">{title}</Text>
                    <Pressable accessibilityLabel={t('review.closeReview')} onPress={handleClose}>
                      <X size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                </GestureDetector>
                {subtitle ? <Text className="mt-1 text-sm text-stone-500 dark:text-zinc-400">{subtitle}</Text> : null}

                <View className="flex-row justify-center gap-2 py-6">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Pressable key={item} onPress={() => setRating(item)} accessibilityLabel={t('review.starsLabel', { count: item })}>
                      <Star size={32} color={colors.amber} fill={item <= rating ? colors.amber : 'transparent'} />
                    </Pressable>
                  ))}
                </View>

                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={t('review.shareExperience')}
                  placeholderTextColor={colors.muted}
                  multiline
                  className="min-h-24 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />

                <View className="mt-4">
                  <Text className="text-xs font-medium text-stone-500 dark:text-zinc-400">{t('review.maxPhotosHint', { count: MAX_PHOTOS })}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" className="mt-2">
                    <View className="flex-row gap-2">
                      {photos.map((uri, index) => (
                        <View key={uri + index} className="relative">
                          <Image source={{ uri }} className="size-20 rounded-xl" contentFit="cover" />
                          <Pressable
                            accessibilityLabel={t('review.removePhoto')}
                            onPress={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                            className="absolute -end-1.5 -top-1.5 size-5 items-center justify-center rounded-full bg-stone-900 dark:bg-zinc-700"
                          >
                            <X size={12} color="#ffffff" />
                          </Pressable>
                        </View>
                      ))}
                      {photos.length < MAX_PHOTOS && (
                        <Pressable
                          accessibilityLabel={t('review.addPhotos')}
                          onPress={openPicker}
                          className="size-20 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 dark:border-zinc-700 dark:bg-zinc-950"
                        >
                          <Plus size={20} color={colors.muted} />
                        </Pressable>
                      )}
                    </View>
                  </ScrollView>
                </View>

                {error ? <Text className="mt-3 text-xs text-red-500">{t('review.submitError')}</Text> : null}

                <Pressable
                  disabled={!canSubmit}
                  onPress={() => void handleSubmit()}
                  className="mt-3 items-center rounded-xl bg-stone-900 py-3 disabled:opacity-40 dark:bg-blue-600"
                >
                  <Text className="text-sm font-semibold text-white">{t(isPending ? 'review.submitting' : 'review.submit')}</Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  )
}
