import { FlatList, Modal, Pressable, View, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

import { useSheetDismissGesture } from '@/components/useSheetDismissGesture'

export function ReviewPhotoViewer({
  visible,
  photos,
  initialIndex,
  onClose,
}: {
  visible: boolean
  photos: string[]
  initialIndex: number
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { width, height } = useWindowDimensions()
  // Requires vertical intent so this yields to the FlatList's own
  // horizontal swipe-between-photos gesture instead of fighting it.
  const { panGesture, animatedStyle } = useSheetDismissGesture(visible, onClose, { requireVerticalIntent: true })

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <View className="flex-1 bg-black">
              <Pressable
                accessibilityLabel={t('review.viewerClose')}
                onPress={onClose}
                className="absolute end-4 top-14 z-10 size-9 items-center justify-center rounded-full bg-white/20"
              >
                <X size={20} color="#ffffff" />
              </Pressable>
              <FlatList
                data={photos}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(uri, index) => uri + index}
                initialScrollIndex={initialIndex}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                renderItem={({ item }) => (
                  <View style={{ width, height }} className="items-center justify-center">
                    <Image source={{ uri: item }} style={{ width, height }} contentFit="contain" />
                  </View>
                )}
              />
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  )
}
