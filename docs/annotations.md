---
title: Annotations
category: Guides
---

# Annotations

Annotations allow you to add interactive elements at specific geographic coordinates on your map. This guide explains how to create and customise annotations with MapLayr.

## Adding an Annotation Layer

Before you can add annotations to your map, you need to create a `CoordinateAnnotationLayer`. This component acts as a container for all your annotations and should be placed inside your `MapView`:

```tsx
import { MapView, CoordinateAnnotationLayer } from '@maplayr/react-native';

<MapView style={styles.map} map={mapLoadResult.map}>
  <CoordinateAnnotationLayer>
    {/* Your annotations go here */}
  </CoordinateAnnotationLayer>
</MapView>
```

Multiple `CoordinateAnnotationLayer`s can be added to the `MapView`, though typically only one is required.

## Adding Annotations

To add individual annotations to your layer, use the `LabeledAnnotationIcon` component. This component creates an interactive marker at a specific coordinate with an optional icon and title.

```tsx
import { LabeledAnnotationIcon } from '@maplayr/react-native';

<CoordinateAnnotationLayer>
  <LabeledAnnotationIcon
    coordinates={{ latitude: 52.8952, longitude: -1.8431 }}
    icon={require('./assets/marker-icon.png')}
    title="Point of Interest"
  />
</CoordinateAnnotationLayer>
```

### Interactive Annotations

Annotations can respond to selection events, allowing you to create interactive map experiences:

```tsx
const [selectedId, setSelectedId] = useState<number | null>(null);

<CoordinateAnnotationLayer>
  <LabeledAnnotationIcon
    coordinates={{ latitude: 52.8952, longitude: -1.8431 }}
    icon={require('./assets/marker-icon.png')}
    title="Attraction 1"
    isSelected={selectedId === 1}
    onSelected={() => setSelectedId(1)}
    onDeselected={() => setSelectedId(null)}
  />
</CoordinateAnnotationLayer>
```

### Rendering Multiple Annotations

A common pattern is to map over an array of data to create multiple annotations:

```tsx
const locations = [
  { id: 1, name: "Location 1", coordinates: { latitude: 52.8952, longitude: -1.8431 } },
  { id: 2, name: "Location 2", coordinates: { latitude: 52.8982, longitude: -1.8463 } },
  { id: 3, name: "Location 3", coordinates: { latitude: 52.8983, longitude: -1.8494 } },
];

<CoordinateAnnotationLayer>
  {locations.map((location) => (
    <LabeledAnnotationIcon
      key={location.id}
      coordinates={location.coordinates}
      icon={require('./assets/marker.png')}
      title={location.name}
      isSelected={selectedId === location.id}
      onSelected={() => setSelectedId(location.id)}
      onDeselected={() => setSelectedId(null)}
    />
  ))}
</CoordinateAnnotationLayer>
```
