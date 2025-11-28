import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

export type MapUpdateEvent = {
    status: 'success' | 'error'
    mapId: string
    version?: string
    error?: string
}

export type LocationUpdateEvent = {
    locationId: string;
    location: string | null;
}

interface Spec extends TurboModule {
    subscribeToUpdatesForMap(mapId: string) : void

    unSubscribeToUpdatesForMap(mapId: string) : void

    createRoute(params: string): string

    cancelRoute(routeId: string): void

    startLocationUpdates(): string

    stopLocationUpdates(locationId: string): void

    // Codegen doesn't support using the type above, so this is just a copy of it. That's why the type is exported here rather than in a separate file.
    readonly onMapUpdate : EventEmitter<{
        status: 'success' | 'error';
        mapId: string;
        version?: string;
        error?: string;
    }>

    readonly onLocationUpdate : EventEmitter<{
        locationId: string;
        location: string | null;
    }>
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeMap');
