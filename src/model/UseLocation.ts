import { useEffect, useState } from 'react';
import { type EventSubscription } from 'react-native';
import NativeMap, { type LocationUpdateEvent } from './codegenSpec/NativeMap';
import type { Location } from '../types/Location';

// Map of location IDs to functions to update the location state
let observers = new globalThis.Map<string, (location: Location | null) => void>();

let nativeLocationListener: EventSubscription | null = null;

/**
 * Hook to access the user's current location.
 * The location updates automatically as the user moves.
 *
 * **Important:** This hook does not request location permissions.
 * You must request permissions separately before location data will be available.
 *
 * @returns The current location or null if location is not available
 *
 * @example
 * ```tsx
 * const currentLocation = useLocation();
 *
 * if (currentLocation) {
 *   console.log(`Lat: ${currentLocation.latitude}, Lon: ${currentLocation.longitude}`);
 * }
 * ```
 */
export function useLocation(): Location | null {
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

    useEffect(() => {
        const resultEncoded = NativeMap.startLocationUpdates();
        const result = JSON.parse(resultEncoded);
        const { id: locationId, location: initialLocation } = result;

        if (initialLocation) {
            setCurrentLocation(initialLocation);
        }

        if (!nativeLocationListener) {
            nativeLocationListener = NativeMap.onLocationUpdate((event: LocationUpdateEvent) => {
                const observer = observers.get(event.locationId);
                if (!observer) {return;}

                if (event.location) {
                    const location: Location = JSON.parse(event.location);

                    observer(location);
                } else {
                    observer(null);
                }
            });
        }

        observers.set(locationId, (location) => {
            setCurrentLocation(location);
        });

        return () => {
            observers.delete(locationId);

            if (observers.size === 0 && nativeLocationListener) {
                nativeLocationListener.remove();
                nativeLocationListener = null;
            }

            NativeMap.stopLocationUpdates(locationId);

            setCurrentLocation(null);
        };
    }, []);

    return currentLocation;
}
