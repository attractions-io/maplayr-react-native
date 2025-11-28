import { Map } from './Map';

/**
 * Represents the result of loading a map, with three possible states:
 * - `pending`: The map is currently being loaded
 * - `success`: The map has loaded successfully and is ready to use
 * - `error`: The map failed to load
 *
 * @example
 * ```tsx
 * const mapLoadResult = useMap(mapId);
 *
 * switch (mapLoadResult.status) {
 *   case "pending":
 *     return <ActivityIndicator />;
 *   case "success":
 *     return <MapView map={mapLoadResult.map} />;
 *   case "error":
 *     return <Text>Error: {mapLoadResult.error.message}</Text>;
 * }
 * ```
 */
export type MapLoadResult =
    | { status: 'pending', map: null, error: null }
    | { status: 'success', map: Map, error: null }
    | { status: 'error', map: null, error: Error };

export const PENDING_RESULT : MapLoadResult = { status: 'pending', map: null, error: null };
