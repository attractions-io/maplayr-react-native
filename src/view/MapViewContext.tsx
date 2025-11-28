import { createContext } from 'react';
import type { AnnotationLayerCallbacks } from './MapView';

export const MapViewContext = createContext<{
    getNextOrder: () => number

    addAnnotationLayer: (
        annotationLayerId: number,
        callbacks: AnnotationLayerCallbacks
    ) => void
    removeAnnotationLayer: (
        annotationLayerId: number
    ) => void

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
    ) => void
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
    ) => void
    removeAnnotation: (
        annotationLayerId: number,
        annotationId: number
    ) => void

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
    ) => void
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
    ) => void
    removeUserLocationMarker: (markerId: number) => void

    addShape: (
        shapeId: number,
        shapeData: {
            routeId: string,
            strokeWidth: number,
            strokeColor: number | null,
            order: number
        }
    ) => void
    updateShape: (
        shapeId: number,
        shapeData: {
            routeId: string,
            strokeWidth: number,
            strokeColor: number | null,
            order: number
        }
    ) => void
    removeShape: (shapeId: number) => void
}>({
    getNextOrder: () => 0,

    addAnnotationLayer: (_annotationLayerId: number) => {},
    removeAnnotationLayer: (_annotationLayerId: number) => {},

    addAnnotation: (
        _annotationLayerId: number,
        _annotationId: number,
        _annotation: {
            title: string | null,
            iconAsset: string | null,
            coordinates: [number, number],
            isSelected: boolean | null,
            labelTextColor: number,
            labelStrokeColor: number
        }
    ) => {},
    updateAnnotation: (
        _annotationLayerId: number,
        _annotationId: number,
        _annotation: {
            title: string | null,
            iconAsset: string | null,
            coordinates: [number, number],
            isSelected: boolean | null,
            labelTextColor: number,
            labelStrokeColor: number
        }
    ) => {},
    removeAnnotation: (
        _annotationLayerId: number,
        _annotationId: number
    ) => {},

    addUserLocationMarker: (
        _markerId: number,
        _userLocation: {
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
    ) => {},
    updateUserLocationMarker: (
        _markerId: number,
        _userLocation: {
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
    ) => {},
    removeUserLocationMarker: () => {},

    addShape: (
        _shapeId: number,
        _shapeData: {
            routeId: string,
            strokeWidth: number,
            strokeColor: number | null,
            order: number
        }
    ) => {},
    updateShape: (
        _shapeId: number,
        _shapeData: {
            routeId: string,
            strokeWidth: number,
            strokeColor: number | null,
            order: number
        }
    ) => {},
    removeShape: () => {},
});
