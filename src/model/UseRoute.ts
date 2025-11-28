import { useEffect, useState } from 'react';
import NativeMap from './codegenSpec/NativeMap';
import { type Route, type UseRouteParams, serializeRouteConfiguration } from '../types/Route';
import type { MapLoadResult } from '../types/MapLoadResult';

/**
 * Hook to calculate a route between two points on the map.
 * The route automatically recalculates when the origin, destination, or options change.
 *
 * @param mapLoadResult - The result from the useMap hook
 * @param params - Route parameters including origin, destination, and optional configuration
 * @returns A Route object containing the distance and route ID, or null if the route cannot be calculated
 *
 * @example
 * ```tsx
 * const route = useRoute(mapLoadResult, {
 *   origin: { latitude: 52.8952, longitude: -1.8431 },
 *   destination: { latitude: 52.8982, longitude: -1.8463 }
 * });
 *
 * if (route) {
 *   console.log(`Distance: ${route.distance} meters`);
 * }
 * ```
 */
export function useRoute(mapLoadResult: MapLoadResult, params: UseRouteParams): Route | null {
    const [routeResult, setRouteResult] = useState<Route | null>(null);

    useEffect(() => {
        if (mapLoadResult.status !== 'success') {
            setRouteResult(null);
            return;
        }

        // TODO:- should `destination` be `destinations`
        if (!params.origin) {
            setRouteResult(null);
            return;
        }

        const resultEncoded = NativeMap.createRoute(JSON.stringify({
            mapId: mapLoadResult.map.id,
            versionId: mapLoadResult.map.version,
            origin: [ params.origin.latitude, params.origin.longitude ],
            destination: Array.isArray(params.destination) ? params.destination.map(d => [ d.latitude, d.longitude ]) : [[ params.destination.latitude, params.destination.longitude ]],
            options: serializeRouteConfiguration(params.options),
        }));

        const result = JSON.parse(resultEncoded);

        if (!result.success) {
            console.log(`Failed to create native route: ${result.error}`);
            return;
        }

        const { route: routeData, routeId } = result;

        const route: Route = {
            distance: routeData.distance,
            routeId,
        };

        setRouteResult(route);

        return () => {
            NativeMap.cancelRoute(routeId);
        };
    }, [
        mapLoadResult,
        params.origin,
        params.destination,
        params.options,
    ]);

    return routeResult;
}
