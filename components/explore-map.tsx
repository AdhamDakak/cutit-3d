import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { Text, View, type LayoutChangeEvent } from 'react-native'
import MapView, { Marker, type Region } from 'react-native-maps'
import { Star } from 'lucide-react-native'

import type { MapBounds } from '@/lib/api'
import type { Venue } from '@/lib/data'
import type { LatLng } from '@/lib/location'

export type ExploreMapHandle = {
  /** Centres `point` in the visible gap between the top chrome and the bottom sheet, keeping the current zoom. */
  centerOn: (point: LatLng) => void
  centerOnUser: () => void
  /** The geographic rectangle actually visible between the chrome and the sheet; null where unsupported (web). */
  getVisibleBounds: () => Promise<MapBounds | null>
}

export type ExploreMapProps = {
  ref?: Ref<ExploreMapHandle>
  establishments: Venue[]
  selectedId?: string | null
  onSelectPin?: (item: Venue) => void
  userLocation: LatLng | null
  /** How much of the map the top chrome and the bottom sheet cover, in dp. */
  insets: { top: number; bottom: number }
  dark?: boolean
}

const CAIRO_CENTER: LatLng = { latitude: 30.0444, longitude: 31.2357 }
// Wide enough to show every mock venue, Sheikh Zayed in the west to New Cairo in the east.
const CAIRO_LNG_SPAN = 0.6
const USER_LNG_SPAN = 0.08
const MIN_VISIBLE_HEIGHT = 80

// Spans that already match the view's aspect ratio, so MapKit doesn't widen one of them on its own and throw off
// the visible-area centring below (which assumes the latitude span it asked for is the one it got).
function regionFor(center: LatLng, lngSpan: number, width: number, height: number): Region {
  const latSpan = lngSpan * Math.cos((center.latitude * Math.PI) / 180) * (height / width)
  return { ...center, latitudeDelta: latSpan, longitudeDelta: lngSpan }
}

function VenuePin({ venue, selected, onPress }: { venue: Venue; selected: boolean; onPress: () => void }) {
  // Custom marker views are snapshotted on Android; re-snapshot briefly whenever the badge's look changes.
  const [tracksViewChanges, setTracksViewChanges] = useState(true)
  useEffect(() => {
    setTracksViewChanges(true)
    const timeout = setTimeout(() => setTracksViewChanges(false), 500)
    return () => clearTimeout(timeout)
  }, [selected, venue.rating])

  return (
    <Marker
      coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      zIndex={selected ? 1 : 0}
      accessibilityLabel={`Select ${venue.name}, rated ${venue.rating}`}
    >
      <View
        className={`flex-row items-center gap-1 rounded-full border px-2 py-1 shadow-sm ${
          selected ? 'border-blue-600 bg-blue-600' : 'border-stone-200 bg-white'
        }`}
      >
        <Star size={11} color={selected ? '#ffffff' : '#fbbf24'} fill={selected ? '#ffffff' : '#fbbf24'} />
        <Text className={`text-[11px] font-semibold ${selected ? 'text-white' : 'text-stone-900'}`}>{venue.rating}</Text>
      </View>
    </Marker>
  )
}

export function ExploreMap({ ref, establishments, selectedId, onSelectPin, userLocation, insets, dark }: ExploreMapProps) {
  const mapRef = useRef<MapView>(null)
  const sizeRef = useRef({ width: 0, height: 0 })
  const regionRef = useRef<Region | null>(null)
  const liveUserRef = useRef<LatLng | null>(null)
  const insetsRef = useRef(insets)
  insetsRef.current = insets
  const centredOnUserRef = useRef(false)

  // The visible area, clamped so a near-fully-raised sheet falls back to the whole map rather than a sliver.
  const visibleArea = () => {
    const { height } = sizeRef.current
    const { top, bottom } = insetsRef.current
    return height - top - bottom >= MIN_VISIBLE_HEIGHT ? { top, bottom } : { top: 0, bottom: 0 }
  }

  const animateTo = (point: LatLng, lngSpan: number | null, duration = 350) => {
    const { width, height } = sizeRef.current
    const current = regionRef.current
    if (!width || !height) return
    const region = lngSpan != null || !current ? regionFor(point, lngSpan ?? CAIRO_LNG_SPAN, width, height) : { ...point, latitudeDelta: current.latitudeDelta, longitudeDelta: current.longitudeDelta }
    // Shift the map centre so `point` lands mid-way between the chrome and the sheet instead of under the sheet.
    const { top, bottom } = visibleArea()
    const visibleCenterY = top + (height - top - bottom) / 2
    const latPerDp = region.latitudeDelta / height
    mapRef.current?.animateToRegion({ ...region, latitude: point.latitude + (visibleCenterY - height / 2) * latPerDp }, duration)
  }

  useImperativeHandle(ref, () => ({
    centerOn: (point) => animateTo(point, null),
    centerOnUser: () => {
      const target = liveUserRef.current ?? userLocation
      if (target) animateTo(target, null)
    },
    getVisibleBounds: async () => {
      const map = mapRef.current
      const { width, height } = sizeRef.current
      if (!map || !width || !height) return null
      const { top, bottom } = visibleArea()
      const [northWest, southEast] = await Promise.all([
        map.coordinateForPoint({ x: 0, y: top }),
        map.coordinateForPoint({ x: width, y: height - bottom }),
      ])
      return { north: northWest.latitude, west: northWest.longitude, south: southEast.latitude, east: southEast.longitude }
    },
  }))

  // Permission usually resolves after the map is up: move to the user once, the first time a position arrives.
  useEffect(() => {
    if (!userLocation || centredOnUserRef.current || !regionRef.current) return
    centredOnUserRef.current = true
    animateTo(userLocation, USER_LNG_SPAN)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation])

  const onLayout = (event: LayoutChangeEvent) => {
    sizeRef.current = { width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height }
  }

  const onMapReady = () => {
    const { width, height } = sizeRef.current
    const start = userLocation ?? CAIRO_CENTER
    regionRef.current = regionFor(start, userLocation ? USER_LNG_SPAN : CAIRO_LNG_SPAN, width || 1, height || 1)
    centredOnUserRef.current = !!userLocation
    animateTo(start, userLocation ? USER_LNG_SPAN : CAIRO_LNG_SPAN, 0)
  }

  return (
    <View className="absolute inset-0" onLayout={onLayout}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{ ...CAIRO_CENTER, latitudeDelta: 0.3, longitudeDelta: CAIRO_LNG_SPAN }}
        onMapReady={onMapReady}
        onRegionChangeComplete={(region) => {
          regionRef.current = region
        }}
        showsUserLocation={!!userLocation}
        onUserLocationChange={(event) => {
          const coordinate = event.nativeEvent.coordinate
          if (coordinate) liveUserRef.current = { latitude: coordinate.latitude, longitude: coordinate.longitude }
        }}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        // North-up only, so the visible area stays an axis-aligned lat/lng rectangle for "Search this area".
        rotateEnabled={false}
        pitchEnabled={false}
        // Keep Apple's legal label above the bottom sheet rather than hidden under it.
        legalLabelInsets={{ top: 0, left: 12, bottom: insets.bottom + 8, right: 0 }}
        userInterfaceStyle={dark ? 'dark' : 'light'}
      >
        {establishments.map((venue) => (
          <VenuePin key={venue.id} venue={venue} selected={selectedId === venue.id} onPress={() => onSelectPin?.(venue)} />
        ))}
      </MapView>
    </View>
  )
}
