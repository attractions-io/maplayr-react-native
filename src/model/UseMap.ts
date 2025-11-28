import { useState, useEffect } from 'react';
import { subscribeToMap } from './MapManager';
import { PENDING_RESULT, type MapLoadResult } from '../types/MapLoadResult';

/**
 * Hook to load and access a map by its ID.
 *
 * @param id - The unique identifier of the map to load
 * @returns A MapLoadResult object with status "pending", "success", or "error"
 *
 * @example
 * ```tsx
 * const mapLoadResult = useMap("your-map-id");
 *
 * if (mapLoadResult.status === "success") {
 *   return <MapView map={mapLoadResult.map} />;
 * }
 * ```
 */
export function useMap(id: string) : MapLoadResult {
    const [mapLoadResult, setMapLoadResult] = useState<MapLoadResult>(PENDING_RESULT);

    useEffect(() => {
        let cancelled = false;

        const observer = (result: MapLoadResult) => {
            if (!cancelled) {
                setMapLoadResult(result);
            }
        };

        // TODO:- FIGURE THIS OUT. I'M SURE THIS GETS CALLED TWICE FOR SOME REASON.
        //        WE ONLY WANT A SINGLE OBSERVER NOT MULTIPLE OF THE SAME. PROBABLY THE MANAGER SHOULD PREVENT AGAINST IT BUT ALSO SHOULDN'T HAPPEN.
        // -- ANSWER: React mounts each component twice during debug builds.
        const unsubscribe = subscribeToMap(id, observer);

        return () => {
            cancelled = true;
            unsubscribe();
            setMapLoadResult(PENDING_RESULT);
        };
    }, [id]);

    return mapLoadResult;
}
