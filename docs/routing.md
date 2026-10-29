---
title: Routing
category: Guides
---

# Routing

MapLayr provides powerful routing capabilities that allow you to calculate paths between locations and display them on your map. This guide explains how to calculate routes, including from the user's location as they move, and display them.

## The `useRoute` Hook

The `useRoute` hook calculates a route from an origin to the closest of one or more destinations. It updates when the origin, destinations, or options change, when the map updates, and as the user moves when routing from their location:

```tsx
import { useRoute } from '@maplayr/react-native';

const routeResult = useRoute(mapLoadResult, {
  origin: { latitude: 52.8952, longitude: -1.8431 },
  destinations: [{ latitude: 52.8982, longitude: -1.8463 }]
});

if (routeResult.status === "success") {
  console.log(`Route distance: ${routeResult.route.distance} meters`);
}
```

### Parameters

The `useRoute` hook takes two parameters:

1. `mapLoadResult` - The result from the `useMap` hook
2. `params` - An object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `origin` | `{ latitude: number, longitude: number } \| UserLocation \| null` | Yes | The starting point of the route, or `UserLocation` to start from the user. Pass `null` to clear the route |
| `destinations` | `Array<{ latitude: number, longitude: number }>` | Yes | The possible end points of the route. The route goes to whichever is closest |
| `options` | `RouteConfiguration \| RouteConfiguration[]` | No | Optional route calculation settings, or a list of them to calculate one route for each |

### Return Value

The hook returns a `RouteResult`, or one per option when `options` is a list, with one of four statuses:

- `idle`: There is nothing to calculate, because `origin` is `null` or the map has not loaded
- `pending`: The route is not available yet, for example while waiting for the user's location
- `success`: The route is available via `routeResult.route`, whose `distance` is its length in metres
- `error`: No route could be calculated, with details in `routeResult.error`

When the origin, destinations or options change, the previous result is kept until the new route has one, so a displayed route does not disappear while it is recalculated.

## Routing from the User's Location

Pass `UserLocation` as the origin to route from the user. The route follows them as they move, and so do any shapes displaying it:

```tsx
import { useRoute, UserLocation } from '@maplayr/react-native';

const routeResult = useRoute(mapLoadResult, {
  origin: UserLocation,
  destinations: [{ latitude: 52.8982, longitude: -1.8463 }]
});
```

The route is `pending` until the user's location is available, and is an `error` if location permission is denied. Location permission must be requested first, as described in [User Location](user-location.md#location-permissions).

## Displaying Routes

To display a route on the map, use the `Shape` component inside your `MapView`:

```tsx
import { Shape } from '@maplayr/react-native';

<MapView style={styles.map} map={mapLoadResult.map}>
  {routeResult.status === "success" && (
    <Shape
      route={routeResult.route}
      strokeWidth={5}
      strokeColor="#007AFF"
    />
  )}
</MapView>
```

### Shape Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `route` | `Route` | Required | The `route` of a successful `useRoute` result |
| `strokeWidth` | `number` | `2` | The width of the line in points |
| `strokeColor` | `ColorValue` | `#FFFFFF` | The color of the route line (any React Native color value) |

## Multiple Destinations

Pass several coordinates to `destinations` to route to the closest one:

```tsx
const destinations = [
  { latitude: 52.8952, longitude: -1.8431 },
  { latitude: 52.8982, longitude: -1.8463 },
  { latitude: 52.8983, longitude: -1.8494 },
];

const routeResult = useRoute(mapLoadResult, {
  origin: UserLocation,
  destinations,
});
```

The routing algorithm will calculate the route to whichever destination is closest via the available paths.

## Route Options

Customize route calculation with the `options` parameter:

```tsx
import { RouteOptions } from '@maplayr/react-native';

const routeResult = useRoute(mapLoadResult, {
  origin: startLocation,
  destinations: [endLocation],
  options: RouteOptions.avoidReducedAccessibility()
});
```

### Comparing Routes with Different Options

Pass a list of options to calculate a route for each, for example to show the accessible route when there is one and the standard route otherwise. The results come back in the same order, and every update holds routes calculated from the same location:

```tsx
const [standard, accessible] = useRoute(mapLoadResult, {
  origin: UserLocation,
  destinations: [endLocation],
  options: [RouteOptions.none(), RouteOptions.avoidReducedAccessibility()]
});

const route = accessible.route ?? standard.route;
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
  {routeResult.status === "success" && (
    <>
      {/* Outer shape - wider, lighter */}
      <Shape
        route={routeResult.route}
        strokeWidth={10}
        strokeColor="#E8FCFF"
      />
      {/* Inner shape - narrower, darker */}
      <Shape
        route={routeResult.route}
        strokeWidth={5}
        strokeColor="#007AFF"
      />
    </>
  )}
</MapView>
```
