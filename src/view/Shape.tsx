import { useContext, useEffect, useRef } from 'react';
import type { ColorValue } from 'react-native';
import { processColor } from 'react-native';
import { MapViewContext } from './MapViewContext';
import type { Route } from '../types/Route';

let currentShapeId = 0;

function getNextShapeId(): number {
    return ++currentShapeId;
}

/**
 * Props for the Shape component
 */
export interface ShapeProps {
    /** The route to display. Obtained from the useRoute hook */
    route: Route;
    /** The width of the line in points. Defaults to 2 */
    strokeWidth?: number;
    /** The color of the route line. Accepts any React Native color value */
    strokeColor?: ColorValue;
}

/**
 * Displays a route on the map as a colored line.
 * Multiple shapes can reference the same route to create visual effects like outlined paths.
 *
 * @example
 * ```tsx
 * const route = useRoute(mapLoadResult, {
 *   origin: startLocation,
 *   destination: endLocation
 * });
 *
 * <MapView map={mapLoadResult.map}>
 *   {route && (
 *     <>
 *       <Shape route={route} strokeWidth={10} strokeColor="#E8FCFF" />
 *       <Shape route={route} strokeWidth={5} strokeColor="#007AFF" />
 *     </>
 *   )}
 * </MapView>
 * ```
 */
export function Shape(props: ShapeProps) {
    const hasBeenAddedRef = useRef<boolean>(false);
    const shapeIdRef = useRef<number>(getNextShapeId());

    const mapViewContext = useContext(MapViewContext);

    const order = mapViewContext.getNextOrder();

    useEffect(() => {
        const strokeColorNumber = (processColor(props.strokeColor ?? undefined) as unknown as number | null);

        const shapeData = {
            routeId: props.route.routeId,
            strokeWidth: props.strokeWidth ?? 2,
            strokeColor: strokeColorNumber,
            order: order,
        };

        if (!hasBeenAddedRef.current) {
            mapViewContext.addShape(
                shapeIdRef.current,
                shapeData
            );
            hasBeenAddedRef.current = true;
        } else {
            mapViewContext.updateShape(
                shapeIdRef.current,
                shapeData
            );
        }
    }, [
        mapViewContext,
        props.route.routeId,
        props.strokeWidth,
        props.strokeColor,
        order,
    ]);

    useEffect(() => {
        const shapeId = shapeIdRef.current;
        return () => {
            mapViewContext.removeShape(shapeId);
        };
    }, [mapViewContext]);

    return null;
}
