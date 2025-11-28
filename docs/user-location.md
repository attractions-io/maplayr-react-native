---
title: User Location
category: Guides
---

# User Location

User location tracking allows you to access and display the user's current position on the map. This guide explains how to get the user's location and display it with a marker.

## The `useLocation` Hook

The `useLocation` hook provides access to the user's current location and returns the current position:

```tsx
import { useLocation } from '@maplayr/react-native';

const currentLocation = useLocation();

// currentLocation will be null until location is available
if (currentLocation) {
  console.log(`Latitude: ${currentLocation.latitude}`);
  console.log(`Longitude: ${currentLocation.longitude}`);
  console.log(`Accuracy: ${currentLocation.horizontalAccuracy} meters`);
}
```

**Important:** The `useLocation` hook does not request location permissions. You must request permissions separately before the location will be available (see [Location Permissions](#location-permissions) below).

### Return Value

The hook returns a `Location` object or `null`. `Location` contains the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `latitude` | `number` | The latitude coordinate |
| `longitude` | `number` | The longitude coordinate |
| `horizontalAccuracy` | `number` | The accuracy of the location in meters |

The location updates automatically as the user moves, and the component will re-render with the new position.

## Displaying a User Location Marker

Use the `UserLocationMarker` component to display the user's location on the map. When used without props, it automatically displays the current location from the device:

```tsx
import { UserLocationMarker } from '@maplayr/react-native';

<MapView style={styles.map} map={mapLoadResult.map}>
  <UserLocationMarker />
</MapView>
```

### Customizing Appearance

Use the `tintColor` prop to customize the marker's color:

```tsx
<UserLocationMarker tintColor="blue" />
<UserLocationMarker tintColor="#FF6B35" />
<UserLocationMarker tintColor="rgb(255, 107, 53)" />
```

### Manual Location Control

You can manually set the marker's position by providing the `location` prop. This is useful for testing, demos, or custom location providers:

```tsx
<UserLocationMarker
  location={{
    latitude: 52.8952,
    longitude: -1.8431,
    horizontalAccuracy: 10
  }}
  tintColor="blue"
/>
```

### Props

| Property | Type | Description |
|----------|------|-------------|
| `tintColor` | `ColorValue` | Optional. The color of the marker (any React Native color value) |
| `location` | `{ latitude: number, longitude: number, horizontalAccuracy?: number }` | Optional. Manually set the marker position. If omitted, uses device location |
| `heading` | `{ direction: number, accuracy: number }` | Optional. The user's heading/compass direction |

## Location Permissions

Before location data is available, you **must** request permissions from the user. The `useLocation` hook does not request permissions automatically.

### Requesting Permissions

One possible way of requesting the location permission is to use the [`react-native-permissions`](https://github.com/zoontek/react-native-permissions) library:

```bash
npm install react-native-permissions
# or
yarn add react-native-permissions
```

Request permissions when your app starts or when you need location data:

```tsx
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

useEffect(() => {
  // Request location permission on mount
  (async () => {
    try {
      const result = await request(
        Platform.select({
          ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        })!
      );
      if (result !== RESULTS.GRANTED) {
        console.warn('Location permission not granted:', result);
      }
    } catch (e) {
      console.warn('Location permission request failed:', e);
    }
  })();
}, []);
```

### iOS Configuration

For iOS, add location usage descriptions to your `Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show you on the map and provide directions</string>
```

### Android Configuration

For Android, add permissions to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```
