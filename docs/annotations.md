---
title: Annotations
category: Guides
---

# Annotations

Annotations allow you to add interactive elements at specific geographic coordinates on your map. This guide explains how to create and customise annotations with MapLayr.

## Adding Annotations

Add a `CoordinateAnnotationLayer` inside your `MapView`, telling it where each annotation goes and how it looks:

```tsx
import { MapView, CoordinateAnnotationLayer } from '@maplayr/react-native';

const rides = [
  { id: '1', name: 'Daeva', coordinates: { latitude: 52.8952, longitude: -1.8431 } },
  { id: '2', name: "Eagle's Flight", coordinates: { latitude: 52.8982, longitude: -1.8463 } },
];

<MapView style={styles.map} map={mapLoadResult.map}>
  <CoordinateAnnotationLayer
    data={rides}
    keyExtractor={(ride) => ride.id}
    coordinates={(ride) => ride.coordinates}
    renderAnnotation={({ item }) => (
      <View style={styles.annotation}>
        <Text>{item.name}</Text>
      </View>
    )}
  />
</MapView>
```

`renderAnnotation` can return any component, and each annotation is sized by its content and styles.
Multiple `CoordinateAnnotationLayer`s can be added to the `MapView`, though typically only one is required.

### Anchoring

By default an annotation is centred on its coordinates. `anchor` sets which point of the annotation
sits on the coordinates instead. Each axis is a percentage of the annotation's size, or a number of
points from its left or top edge. An annotation that points down at its coordinates is anchored at
its bottom centre:

```tsx
<CoordinateAnnotationLayer anchor={{ x: '50%', y: '100%' }} ... />
```

Points keep one part of an annotation on its coordinates however the rest is sized. For a 26 point
icon with a label below it, this anchors on the centre of the icon:

```tsx
<CoordinateAnnotationLayer anchor={{ x: '50%', y: 13 }} ... />
```

Pass a function to anchor each item differently.

## Selection

Selection is controlled by your component. A tap calls `onSelect` or `onDeselect` with the item, and
the layer shows whatever `selectedKeys` says on the next render, so hold the selection in state.
`renderAnnotation` receives `isSelected` so the annotation can change how it looks:

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);

<CoordinateAnnotationLayer
  data={rides}
  keyExtractor={(ride) => ride.id}
  coordinates={(ride) => ride.coordinates}
  selectedKeys={selectedId ? [selectedId] : []}
  onSelect={(ride) => setSelectedId(ride.id)}
  onDeselect={(ride) => setSelectedId((current) => (current === ride.id ? null : current))}
  renderAnnotation={({ item, isSelected }) =>
    <RideAnnotation ride={item} selected={isSelected} />
  }
/>
```

### Multiple Selection

By default only one annotation can be selected at a time: tapping an annotation selects it in place
of the previous one, and tapping the map clears the selection. With `allowsMultipleSelection`, each
tap adds or removes that annotation from the selection:

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<CoordinateAnnotationLayer
  allowsMultipleSelection
  selectedKeys={selectedIds}
  onSelect={(ride) => setSelectedIds((ids) => [...ids, ride.id])}
  onDeselect={(ride) => setSelectedIds((ids) => ids.filter((id) => id !== ride.id))}
  ...
/>
```

### Touchable Content

The map decides selection from where a tap lands, whatever the annotation renders. Touchable
components inside an annotation, such as `Pressable`, still work, and a tap on one also counts as a
tap on its annotation: it selects the annotation, or with `allowsMultipleSelection` adds or removes
it from the selection.

## Rendering From the Item

An annotation's component may be reused for a different item, so render it only from `item` and `isSelected`:

- Keep state that should last in `data`, updating the item it belongs to.
- Give the part of an annotation that holds state that should reset for each item `key={item.id}`.
- Make effects that concern the item depend on it, such as `[item.id]`.

An annotation re-renders only when its item, its selection, or one of `renderAnnotation`,
`coordinates` and `anchor` changes. With many annotations, keep those stable, with `useCallback`
or a constant, and replace only the items that change, so that a change re-renders only the
annotations it affects.

Give items whose annotations are built differently their own `annotationType`, which helps the layer render them efficiently.
