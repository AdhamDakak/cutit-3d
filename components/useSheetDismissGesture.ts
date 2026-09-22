import { useEffect } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

// Bottom-sheet-style Modals built as a plain <Modal> + styled <View> (every
// sheet in this app except @gorhom/bottom-sheet's own Explore panel) don't
// get swipe-to-dismiss for free the way a route pushed via expo-router's
// Stack does — this recreates just that one gesture, reusing the same
// react-native-gesture-handler + react-native-reanimated dependencies
// @gorhom/bottom-sheet already pulls in, rather than adopting the whole
// library for these small, form-shaped sheets.
const DISMISS_DISTANCE_THRESHOLD = 100
const DISMISS_VELOCITY_THRESHOLD = 800

export type SheetDismissGestureOptions = {
  /**
   * Requires the drag to commit vertically before this gesture activates,
   * and fails it outright if the drag moves horizontally first — so it
   * yields to a horizontal pager (review-photo-viewer.tsx's swipe-between-
   * photos FlatList) instead of fighting it. Bottom-sheet cards with no
   * horizontal gesture of their own don't need this.
   */
  requireVerticalIntent?: boolean
}

/**
 * Returns a pan gesture — attach to the sheet's drag handle (its header,
 * not a scrollable body, to avoid fighting a ScrollView's own vertical pan)
 * — and an animated style — attach to the sheet's whole card — that
 * together let dragging the handle down past a distance or velocity
 * threshold call `onDismiss`, the same handler the header's X button uses.
 * Releasing short of the threshold springs the card back to its resting
 * position. `visible` resets the drag position each time the sheet
 * reopens, since the underlying Modal's content stays mounted between
 * shows rather than remounting.
 */
export function useSheetDismissGesture(visible: boolean, onDismiss: () => void, options?: SheetDismissGestureOptions) {
  const translateY = useSharedValue(0)

  useEffect(() => {
    if (visible) translateY.value = 0
  }, [visible, translateY])

  let panGesture = Gesture.Pan()
  if (options?.requireVerticalIntent) {
    panGesture = panGesture.activeOffsetY([-10, 10]).failOffsetX([-10, 10])
  }
  panGesture = panGesture
    .onChange((event) => {
      // A bottom sheet only drags down from its resting position, never up past it.
      translateY.value = Math.max(0, translateY.value + event.changeY)
    })
    .onEnd((event) => {
      const shouldDismiss = translateY.value > DISMISS_DISTANCE_THRESHOLD || event.velocityY > DISMISS_VELOCITY_THRESHOLD
      if (shouldDismiss) {
        runOnJS(onDismiss)()
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 })
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return { panGesture, animatedStyle }
}
