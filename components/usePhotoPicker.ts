import { useState } from 'react'
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useTranslation } from 'react-i18next'

// expo-image-picker has no direct "max dimension" option — quality is its own
// long-edge/compression knob, which is what the mock uses to stand in for a
// real resize-to-1600px pass (a future upload step would do that for real).
const PHOTO_QUALITY = 0.7

/** Camera / library photo picking capped at `max` photos — shared by the review modal and Report an issue. */
export function usePhotoPicker(max: number) {
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<string[]>([])

  const addPhotos = (uris: string[]) => {
    setPhotos((prev) => [...prev, ...uris].slice(0, max))
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
      selectionLimit: max - photos.length,
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

  const removePhoto = (index: number) => setPhotos((prev) => prev.filter((_, i) => i !== index))

  return { photos, setPhotos, openPicker, removePhoto }
}
