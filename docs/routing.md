---
title: Routing
category: Guides
---

# Routing

MapLayr provides powerful routing capabilities that allow you to calculate paths between locations and display them on your map. This guide explains how to calculate routes and display them reactively.

## The `useRoute` Hook

The `useRoute` hook calculates a route between two points and automatically recalculates when the origin, destination, or options change:

```tsx
import { useRoute } from '@maplayr/react-native';

const route = useRoute(mapLoadResult, {
  origin: { latitude: 52.8952, longitude: -1.8431 },
  destination: { latitude: 52.8982, longitude: -1.8463 }
});

// Route will be null if origin is null or if calculation fails
if (route) {
  console.log(`Route distance: ${route.distance} meters`);
}
```

### Parameters

The `useRoute` hook takes two parameters:

1. `mapLoadResult` - The result from the `useMap` hook
2. `params` - An object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `origin` | `{ latitude: number, longitude: number } \| null` | Yes | The starting point of the route. Pass `null` to clear the route |
| `destination` | `{ latitude: number, longitude: number } \| Array<{ latitude: number, longitude: number }>` | Yes | The end point(s) of the route. If an array is provided, routes to the closest destination |
| `options` | `RouteConfiguration` | No | Optional route calculation settings |

### Return Value

The hook returns a `Route` object or `null`. `Route` contains a property `distance` which is the length of the route in metres.

## Displaying Routes

To display a route on the map, use the `Shape` component inside your `MapView`:

```tsx
import { Shape } from '@maplayr/react-native';

<MapView style={styles.map} map={mapLoadResult.map}>
  {route && (
    <Shape
      route={route}
      strokeWidth={5}
      strokeColor="#007AFF"
    />
  )}
</MapView>
```

### Shape Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `route` | `Route` | Required | The route object from `useRoute` |
| `strokeWidth` | `number` | `2` | The width of the line in points |
| `strokeColor` | `ColorValue` | - | The color of the route line (any React Native color value) |

## Multiple Destinations

Pass an array of coordinates to `destination` to route to the closest point:

```tsx
const destinations = [
  { latitude: 52.8952, longitude: -1.8431 },
  { latitude: 52.8982, longitude: -1.8463 },
  { latitude: 52.8983, longitude: -1.8494 },
];

const route = useRoute(mapLoadResult, {
  origin: userLocation,
  destination: destinations  // Routes to the closest destination
});
```

The routing algorithm will calculate the route to whichever destination is closest via the available paths.

## Route Options

Customize route calculation with the `options` parameter:

```tsx
import { RouteOptions } from '@maplayr/react-native';

const route = useRoute(mapLoadResult, {
  origin: startLocation,
  destination: endLocation,
  options: RouteOptions.avoidReducedAccessibility()
});
```

### Available Options

| Option | Type | Description |
|--------|------|-------------|
| `avoidFlags` | `Set<string>` | Set of edge flags to avoid when calculating routes (e.g., "stairs", "reducedAccessibility") |
| `attachEndpointsToAllowedPathsOnly` | `boolean` | When `true`, only attaches route endpoints to paths that satisfy the route options. Default: `false` |
| `originSpurStrategy` | `"curved" \| "straight" \| "none"` | How to connect the origin to the path network. Default: `"curved"` |
| `destinationSpurStrategy` | `"curved" \| "straight" \| "none"` | How to connect the destination to the path network. Default: `"curved"` |

## Styling with Multiple Shapes

Create visual depth by layering multiple shapes:

```tsx
<MapView style={styles.map} map={mapLoadResult.map}>
  {route && (
    <>
      {/* Outer shape - wider, lighter */}
      <Shape
        route={route}
        strokeWidth={10}
        strokeColor="#E8FCFF"
      />
      {/* Inner shape - narrower, darker */}
      <Shape
        route={route}
        strokeWidth={5}
        strokeColor="#007AFF"
      />
    </>
  )}
</MapView>
```
