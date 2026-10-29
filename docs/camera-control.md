---
title: Camera Control
category: Guides
---

# Camera Control

MapLayr provides powerful camera control capabilities that allow you to programmatically navigate your map. This guide explains how to move and manipulate the camera view.

## Getting a Map View Reference

To control the camera, you need a reference to the `MapView` component. Use React's `useRef` hook to create a reference:

```tsx
import { useRef } from 'react';
import { MapView } from '@maplayr/react-native';
import type { MapViewHandle } from '@maplayr/react-native';

const mapViewRef = useRef<MapViewHandle>(null);

<MapView ref={mapViewRef} style={styles.map} map={mapLoadResult.map}>
  {/* Map content */}
</MapView>
```

Once you have the reference, you can call `mapViewRef.current?.moveCamera()` to control the camera.

## Moving the Camera

The `moveCamera` method lets you adjust various camera properties. All properties are optional:

```tsx
mapViewRef.current?.moveCamera({
  location: { latitude: 52.8952, longitude: -1.8431 },
  heading: 45,
  span: 500,
  insets: 20,
  tilt: 30,
  animated: true
});
```

### Camera Properties

| Property | Type | Description |
|----------|------|-------------|
| `location` | `{ latitude: number, longitude: number }` or `Array<{ latitude: number, longitude: number }>` | The coordinates to center on. Can be a single location or an array of locations to fit in view |
| `span` | `number` | The distance in meters shown from top to bottom or left to right (whichever is smaller) |
| `route` | `Route` | A route object to fit in the camera view |
| `followUserLocation` | `boolean` | Keeps the camera centred on the user's location and turned to their heading until the user moves the map |
| `heading` | `number` | The orientation in degrees relative to true north (0° = north, 90° = east, 180° = south, 270° = west) |
| `insets` | `number` | Additional space in points around the frame after span calculations |
| `tilt` | `number` | The camera's tilt angle in degrees |
| `animated` | `boolean` | Whether to animate the transition (defaults to `false`) |

The `location`, `route` and `followUserLocation` parameters are mutually exclusive. If an array of coordinates are passed to `location`, or a `route` is specified, the `span` property should be omitted. Otherwise, any remaining omitted property will be unchanged from its current value.

## Following the User

Pass `followUserLocation` to keep the camera centred on the user and turned to their heading as they
move. Following ends when the user drags the map or a later `moveCamera` call takes the camera
elsewhere. `MapView` reports every such change through `onCameraTargetChange`, whose `tracking` is
`"userLocation"` while following and `"none"` otherwise:

```tsx
const [isFollowingUser, setIsFollowingUser] = useState(false);

<MapView
  ref={mapViewRef}
  style={styles.map}
  map={mapLoadResult.map}
  onCameraTargetChange={({ tracking }) => setIsFollowingUser(tracking === 'userLocation')}
/>

mapViewRef.current?.moveCamera({ followUserLocation: true, span: 200, animated: true });
```

Location permission must already be granted, as for `UserLocationMarker`.

## Content Insets

The `contentInsets` prop marks space along each edge of the view as covered. Values are in points.
The camera centres and fits content within the remaining area:

```tsx
<MapView style={styles.map} map={mapLoadResult.map} contentInsets={{ bottom: 120 }} />
```

The map does not add the device's safe area on either platform. If the map extends under the status
bar, notch or home indicator, include those insets yourself, for example from
[`react-native-safe-area-context`](https://github.com/AppAndFlow/react-native-safe-area-context):

```tsx
const insets = useSafeAreaInsets();

<MapView style={styles.map} map={mapLoadResult.map} contentInsets={{ ...insets, bottom: insets.bottom + 120 }} />
```

## Examples

### Moving to a Single Location

Move the camera to a specific coordinate:

```tsx
mapViewRef.current?.moveCamera({
  location: { latitude: 52.8952, longitude: -1.8431 },
  span: 300,
  animated: true
});
```

### Fitting Multiple Locations

When you pass an array of locations, the camera automatically adjusts to fit all points:

```tsx
const locations = [
  { latitude: 52.8952, longitude: -1.8431 },
  { latitude: 52.8982, longitude: -1.8463 },
  { latitude: 52.8983, longitude: -1.8494 },
];

mapViewRef.current?.moveCamera({
  location: locations,
  animated: true
});
```

This is particularly useful for showing all annotations at once.

### Changing Orientation

Rotate the map to face a different direction:

```tsx
// Face east
mapViewRef.current?.moveCamera({
  heading: 90,
  animated: true
});

// Face south
mapViewRef.current?.moveCamera({
  heading: 180,
  animated: true
});
```

### Adjusting Zoom Level

Control how much area is visible:

```tsx
// Zoom in to show a 200-meter area
mapViewRef.current?.moveCamera({
  span: 200,
  animated: true
});

// Zoom out to show a 1000-meter area
mapViewRef.current?.moveCamera({
  span: 1000,
  animated: true
});
```

### Tilting the Camera

Adjust the camera's viewing angle:

```tsx
mapViewRef.current?.moveCamera({
  tilt: 45,
  animated: true
});
```

### Combined Operations

Update multiple camera properties in a single operation:

```tsx
mapViewRef.current?.moveCamera({
  location: { latitude: 52.8952, longitude: -1.8431 },
  heading: 45,
  span: 300,
  tilt: 30,
  animated: true
});
```
