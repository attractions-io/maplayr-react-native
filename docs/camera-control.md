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
| `heading` | `number` | The orientation in degrees relative to true north (0° = north, 90° = east, 180° = south, 270° = west) |

| `insets` | `number` | Additional space in points around the frame after span calculations |
| `tilt` | `number` | The camera's tilt angle in degrees |
| `animated` | `boolean` | Whether to animate the transition (defaults to `false`) |

The `location` and `route` parameters are mututally exclusive. If an array of coordinates are passed to `location`, or a `route` is specified, the `span` property should be ommitted. Otherwise, any remaining omitted property will be unchanged from its current value.

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
