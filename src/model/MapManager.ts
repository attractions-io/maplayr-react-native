import NativeMap from './codegenSpec/NativeMap';
import type { MapUpdateEvent } from './codegenSpec/NativeMap';
import type { EventSubscription } from 'react-native';
import { Map } from '../types/Map';
import { type MapLoadResult, PENDING_RESULT } from '../types/MapLoadResult';

class VersionedMapWithObservers {

    id: string;
    latestMap : Map | null = null;
    maps: Map[] = [];
    observers: ((mapLoadResult: MapLoadResult) => void)[] = [];

    constructor(id: string) {
        this.id = id;
    }
}

let nativeMapListener : EventSubscription | null = null;

let versionedMaps : VersionedMapWithObservers[] = [];

const nativeEventEmitterObserver = (mapUpdateEvent: MapUpdateEvent) => {
    let versionedMapForId = versionedMaps.find(versionedMap => versionedMap.id === mapUpdateEvent.mapId);
    if (versionedMapForId) {
        switch (mapUpdateEvent.status) {
            case 'success':
                let updatedMap = new Map(mapUpdateEvent.mapId, mapUpdateEvent.version!);
                versionedMapForId.maps.push(updatedMap);
                versionedMapForId.latestMap = updatedMap;
                const successResult : MapLoadResult = {
                    status: 'success',
                    map: updatedMap,
                    error: null,
                };
                versionedMapForId.observers.forEach(observer => observer(successResult));
                break;
            case 'error':
                const errorResult : MapLoadResult = {
                    status: 'error',
                    map: null,
                    error: Error(mapUpdateEvent.error),
                };
                versionedMapForId.observers.forEach(observer => observer(errorResult));
                break;
            default:
                throw Error('Unsupported status for mapUpdateEvent');
        }
    } else {
        // This is probably a bug but could also happen due to threading potentially not sure. Can maybe just throw see if it does happen.
        throw Error('Received an update for a map that is no longer subscribed to');
    }
};

export function subscribeToMap(id: string, observer: (map: MapLoadResult) => void) : (() => void) {
    if (versionedMaps.length === 0) {
        nativeMapListener = NativeMap.onMapUpdate((mapUpdateEvent: MapUpdateEvent) => nativeEventEmitterObserver(mapUpdateEvent));
    }

    let versionedMap = versionedMaps.find(vm => vm.id === id);
    if (versionedMap) {
        versionedMap.observers.push(observer);
        if (versionedMap.latestMap != null) {
            observer({
                status: 'success',
                map: versionedMap.latestMap,
                error: null,
            });
        }
    } else {
        NativeMap.subscribeToUpdatesForMap(id);
        versionedMap = new VersionedMapWithObservers(id);
        versionedMap.observers.push(observer);
        versionedMaps.push(versionedMap);
        observer(PENDING_RESULT);
    }

    return () => {
        unsubscribeToMap(observer, versionedMap);
    };
}

function unsubscribeToMap(observer: (map: MapLoadResult) => void, versionedMapForId: VersionedMapWithObservers) {
    versionedMapForId.observers = versionedMapForId.observers.filter(mapObserver => mapObserver === observer);
    if (versionedMapForId.observers.length === 0) {
        NativeMap.unSubscribeToUpdatesForMap(versionedMapForId.id);
        versionedMaps = versionedMaps.filter(versionedMap => versionedMap === versionedMapForId);
        if (versionedMaps.length === 0) {
            nativeMapListener?.remove();
            nativeMapListener = null;
        }
    }
}
