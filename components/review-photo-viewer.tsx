import { FlatList, Modal, Pressable, View, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'

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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
    </Modal>
  )
}
