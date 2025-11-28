import { useContext, useEffect, useRef } from 'react';
import type { ColorValue } from 'react-native';
import { processColor } from 'react-native';
import { MapViewContext } from './MapViewContext';

let currentMarkerId = 0;

function getNextMarkerId(): number {
    return ++currentMarkerId;
}

/**
 * Props for the UserLocationMarker component
 */
export interface UserLocationMarkerProps {
    /** The color of the marker. Accepts any React Native color value */
    tintColor?: ColorValue
    /** Manually set the marker position. If omitted, uses device location from useLocation hook */
    location?: {
        /** The latitude coordinate */
        latitude: number
        /** The longitude coordinate */
        longitude: number
        /** The accuracy of the location in meters */
        horizontalAccuracy?: number
    }
    /** The user's heading/compass direction */
    heading?: {
        /** The direction in degrees */
        direction: number
        /** The accuracy of the heading */
        accuracy: number
    }
}

/**
 * Displays the user's current location on the map.
 * When used without props, it automatically displays the current location from the device.
 *
 * **Note:** You must request location permissions before the marker will display.
 * The useLocation hook does not request permissions automatically.
 *
 * @example
 * ```tsx
 * // Automatic location from device
 * <MapView map={mapLoadResult.map}>
 *   <UserLocationMarker tintColor="blue" />
 * </MapView>
 *
 * // Manual location
 * <MapView map={mapLoadResult.map}>
 *   <UserLocationMarker
 *     location={{ latitude: 52.8952, longitude: -1.8431 }}
 *     tintColor="#FF6B35"
 *   />
 * </MapView>
 * ```
 */
export function UserLocationMarker(props: UserLocationMarkerProps) {
    const hasBeenAddedRef = useRef<boolean>(false);
    const markerIdRef = useRef<number>(getNextMarkerId());

    const mapViewContext = useContext(MapViewContext);

    useEffect(() => {
        const tintColorNumber = (processColor(props.tintColor ?? undefined) as unknown as number | null);

        const userLocation = {
            tintColor: tintColorNumber,
            location: props.location ? {
                coordinates: [props.location.latitude, props.location.longitude] as [number, number],
                horizontalAccuracy: props.location.horizontalAccuracy ?? undefined,
            } : null,
            heading: props.heading ? {
                direction: props.heading.direction,
                accuracy: props.heading.accuracy,
            } : null,
        };

        if (!hasBeenAddedRef.current) {
            mapViewContext.addUserLocationMarker(
                markerIdRef.current,
                userLocation
            );
            hasBeenAddedRef.current = true;
        } else {
            mapViewContext.updateUserLocationMarker(
                markerIdRef.current,
                userLocation
            );
        }
    }, [
        mapViewContext,
        props.tintColor,
        props.location,
        props.heading,
    ]);

    useEffect(() => {
        const markerId = markerIdRef.current;
        return () => {
            mapViewContext.removeUserLocationMarker(markerId);
        };
    }, [mapViewContext]);

    return null;
}


