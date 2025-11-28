import { createContext } from 'react';
import type { AnnotationCallbacks } from './CoordinateAnnotationLayer';

export const CoordinateAnnotationLayerContext = createContext<{
    addAnnotation: (
        annotationId: number,
        annotation: {
            title?: string | null | undefined,
            iconAsset?: string | null | undefined,
            coordinates: [number, number],
            isSelected: boolean | null
        },
        callbacks: AnnotationCallbacks
    ) => void,

    updateAnnotation: (
        annotationId: number,
        annotation: {
            title?: string | null | undefined,
            iconAsset?: string | null | undefined,
            coordinates: [number, number],
            isSelected: boolean | null
        }
    ) => void,

    removeAnnotation: (
        annotationId: number
    ) => void
}>({
    addAnnotation: (
        _annotationId: number,
        _annotation: { title?: string | null | undefined, iconAsset?: string | null | undefined, coordinates: [number, number] },
        _callbacks: AnnotationCallbacks
    ) => {},
    updateAnnotation: (
        _annotationId: number,
        _annotation: { title?: string | null | undefined, iconAsset?: string | null | undefined, coordinates: [number, number] }
    ) => {},
    removeAnnotation: (
        _annotationId: number
    ) => {},
});
