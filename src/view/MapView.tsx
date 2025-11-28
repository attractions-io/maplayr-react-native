import { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import ReactNativeMapView from './codegenSpec/MapViewNativeComponent';
import { type MapViewProps, Commands } from './codegenSpec/MapViewNativeComponent';
import { MapViewContext } from './MapViewContext';
import { type Route } from '../types/Route';
import { type Coordinate } from '../types/Location';

export type { MapViewProps };

/**
 * Options for controlling the map camera position
 */
export type MoveCameraOptions = {
  /** The coordinates to center on. Can be a single location or an array of locations to fit in view */
  location?: Coordinate | Iterable<Coordinate>;
  /** The orientation in degrees relative to true north (0° = north, 90° = east, 180° = south, 270° = west) */
  heading?: number;
  /** The distance in meters shown from top to bottom or left to right of the screen (whichever is smaller) */
  span?: number;
  /** A route object to fit in the camera view */
  route?: Route | null,
  /** Additional space in points around the frame after span calculations */
  insets?: number;
  /** The camera's tilt angle in degrees */
  tilt?: number;
  /** Whether to animate the transition to the new camera position. Defaults to false */
  animated?: boolean;
};

/**
 * Handle interface for MapView component, providing imperative control over the map
 */
export type MapViewHandle = {
  /** Moves the map camera to a new position with the specified options */
  moveCamera: (options: MoveCameraOptions) => void;
};

export type AnnotationLayerCallbacks = {
    onAnnotationSelected: (annotationId: number) => void,
    onAnnotationDeselected: (annotationId: number) => void
}

/**
 * The main map view component that displays a MapLayr map.
 *
 * @example
 * ```tsx
 * const mapLoadResult = useMap("your-map-id");
 * const mapViewRef = useRef<MapViewHandle>(null);
 *
 * if (mapLoadResult.status === "success") {
 *   return (
 *     <MapView ref={mapViewRef} style={styles.map} map={mapLoadResult.map}>
 *       <UserLocationMarker />
 *       <CoordinateAnnotationLayer>
 *         <LabeledAnnotationIcon coordinates={...} />
 *       </CoordinateAnnotationLayer>
 *     </MapView>
 *   );
 * }
 * ```
 */
export const MapView = forwardRef<MapViewHandle, MapViewProps>(({ children, ...reactNativeMapViewProps }, ref) => {

    const mapRef = useRef<React.ElementRef<typeof ReactNativeMapView> | null>(null);
    const annotationLayerCallbacks = useRef<Map<number, AnnotationLayerCallbacks>>(new Map());

    // Reset order counter on each render - this gives us correct ordering based on JSX position
    let orderCounter = 0;

    const getNextOrder = () => {
        const currentOrder = orderCounter;
        orderCounter += 1;
        return currentOrder;
    };

    const publicMapViewFunctions : MapViewHandle = useMemo(() => ({
        moveCamera: (
            options: MoveCameraOptions
        ) => {
            // I guess it could be called before the mapRef is mounted? Not sure. Everywhere else it just `!` it.
            if (mapRef.current) {
                Commands.moveCamera(mapRef.current, JSON.stringify({
                    ...options,
                    route: options.route?.routeId ?? null,
                }));
            }
        },
    }), []);

    useImperativeHandle(ref, () => publicMapViewFunctions, [publicMapViewFunctions]);

    const internalMapViewFunctions = useMemo(() => ({
        getNextOrder,

        addAnnotationLayer: (annotationLayerId: number, callbacks: AnnotationLayerCallbacks) => {
            annotationLayerCallbacks.current.set(annotationLayerId, callbacks);
            Commands.addAnnotationLayer(mapRef.current!, annotationLayerId);
        },
        removeAnnotationLayer: (annotationLayerId: number) => {
            annotationLayerCallbacks.current.delete(annotationLayerId);
            Commands.removeAnnotationLayer(mapRef.current!, annotationLayerId);
        },

        addAnnotation: (
            annotationLayerId: number,
            annotationId: number,
            annotation: {
                title: string | null,
                iconAsset: string | null,
                coordinates: [number, number],
                isSelected: boolean | null,
                labelTextColor: number,
                labelStrokeColor: number
            }
        ) => {
            Commands.addAnnotation(
                mapRef.current!,
                annotationLayerId,
                annotationId,
                JSON.stringify({
                    title: annotation.title ?? null,
                    iconAsset: annotation.iconAsset ?? null,
                    coordinates: annotation.coordinates,
                    isSelected: annotation.isSelected,
                    labelTextColor: annotation.labelTextColor,
                    labelStrokeColor: annotation.labelStrokeColor,
                })
            );
        },
        updateAnnotation: (
            annotationLayerId: number,
            annotationId: number,
            annotation: {
                title: string | null,
                iconAsset: string | null,
                coordinates: [number, number],
                isSelected: boolean | null,
                labelTextColor: number,
                labelStrokeColor: number
            }
        ) => {
            Commands.updateAnnotation(
                mapRef.current!,
                annotationLayerId,
                annotationId,
                JSON.stringify({
                    title: annotation.title ?? null,
                    iconAsset: annotation.iconAsset ?? null,
                    coordinates: annotation.coordinates,
                    isSelected: annotation.isSelected,
                    labelTextColor: annotation.labelTextColor,
                    labelStrokeColor: annotation.labelStrokeColor,
                })
            );
        },
        removeAnnotation: (annotationLayerId: number, annotationId: number) => {
            Commands.removeAnnotation(mapRef.current!, annotationLayerId, annotationId);
        },

        addUserLocationMarker: (
            markerId: number,
            userLocation: {
                tintColor: number | null,
                location: {
                    coordinates: [number, number],
                    horizontalAccuracy?: number
                } | null,
                heading: {
                    direction: number,
                    accuracy: number
                } | null
            }
        ) => {
            Commands.addUserLocationMarker(
                mapRef.current!,
                markerId,
                JSON.stringify({
                    tintColor: userLocation.tintColor,
                    location: userLocation.location ?? null,
                    heading: userLocation.heading ?? null,
                })
            );
        },
        updateUserLocationMarker: (
            markerId: number,
            userLocation: {
                tintColor: number | null,
                location: {
                    coordinates: [number, number],
                    horizontalAccuracy?: number
                } | null,
                heading: {
                    direction: number,
                    accuracy: number
                } | null
            }
        ) => {
            Commands.updateUserLocationMarker(
                mapRef.current!,
                markerId,
                JSON.stringify({
                    tintColor: userLocation.tintColor,
                    location: userLocation.location ?? null,
                    heading: userLocation.heading ?? null,
                })
            );
        },
        removeUserLocationMarker: (markerId: number) => {
            Commands.removeUserLocationMarker(mapRef.current!, markerId);
        },

        addShape: (
            shapeId: number,
            shapeData: {
                routeId: string,
                strokeWidth: number,
                strokeColor: number | null,
                order: number
            }
        ) => {
            Commands.addShape(
                mapRef.current!,
                shapeId,
                JSON.stringify({
                    routeId: shapeData.routeId,
                    strokeWidth: shapeData.strokeWidth,
                    strokeColor: shapeData.strokeColor,
                    order: shapeData.order,
                })
            );
        },
        updateShape: (
            shapeId: number,
            shapeData: {
                routeId: string,
                strokeWidth: number,
                strokeColor: number | null,
                order: number
            }
        ) => {
            Commands.updateShape(
                mapRef.current!,
                shapeId,
                JSON.stringify({
                    routeId: shapeData.routeId,
                    strokeWidth: shapeData.strokeWidth,
                    strokeColor: shapeData.strokeColor,
                    order: shapeData.order,
                })
            );
        },
        removeShape: (shapeId: number) => {
            Commands.removeShape(mapRef.current!, shapeId);
        },
    }), []);

    return (
        <ReactNativeMapView
            ref={mapRef}
            onAnnotationSelected={(event) => {
                const { annotationLayerId, annotationId } = event.nativeEvent;
                annotationLayerCallbacks.current.get(annotationLayerId)?.onAnnotationSelected(annotationId);
            }}
            onAnnotationDeselected={(event) => {
                const { annotationLayerId, annotationId } = event.nativeEvent;
                annotationLayerCallbacks.current.get(annotationLayerId)?.onAnnotationDeselected(annotationId);
            }}
            {...reactNativeMapViewProps}
        >
            <MapViewContext value={internalMapViewFunctions}>
                {children}
            </MapViewContext>
        </ReactNativeMapView>
    );
});
