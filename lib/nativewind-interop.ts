import { Image } from 'expo-image'
import { cssInterop } from 'nativewind'

// expo-image's <Image> doesn't accept className out of the box — NativeWind
// only maps className -> style automatically for react-native's own
// primitives. Every <Image> in this app is from expo-image and styled with
// className, so this registers the mapping once, globally, instead of at
// every call site.
cssInterop(Image, { className: 'style' })
