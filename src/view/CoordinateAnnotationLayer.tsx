import { useEffect, useContext, useState, useRef, useMemo } from 'react';
import { MapViewContext } from './MapViewContext';
import { CoordinateAnnotationLayerContext } from './CoordinateAnnotationLayerContext';

let currentAnnotationLayerId = 0;

function getNextAnnotationLayerId(): number {
    return ++currentAnnotationLayerId;
}

/**
 * Props for the CoordinateAnnotationLayer component
 */
export interface CoordinateAnnotationLayerProps {
    /** Child components (typically LabeledAnnotationIcon components) */
    children? : React.ReactNode
}

export type AnnotationCallbacks = {
    onSelected: () => void,
    onDeselected: () => void
}

/**
 * A container component for map annotations.
 * Place LabeledAnnotationIcon components inside this layer to display them on the map.
 * Multiple annotation layers can be added to a MapView if needed.
 *
 * @example
 * ```tsx
 * <MapView map={mapLoadResult.map}>
 *   <CoordinateAnnotationLayer>
 *     <LabeledAnnotationIcon
 *       coordinates={{ latitude: 52.8952, longitude: -1.8431 }}
 *       icon={require('./marker.png')}
 *       title="Point of Interest"
 *     />
 *   </CoordinateAnnotationLayer>
 * </MapView>
 * ```
 */
export function CoordinateAnnotationLayer({ children }: CoordinateAnnotationLayerProps) {

    const annotationLayerId = useRef<number>(getNextAnnotationLayerId());

    const [annotationLayerCreated, setAnnotationLayerCreated] = useState<boolean>(false);

    const mapViewContext = useContext(MapViewContext);

    const annotationCallbacks = useRef<Map<number, AnnotationCallbacks>>(new Map());

    const coordinateAnnotationLayerFunctions = useMemo(() => (
        {
            addAnnotation: (
                annotationId: number,
                annotation: {
                    title?: string | null | undefined,
                    iconAsset?: string | null | undefined,
                    coordinates: [number, number],
                    isSelected: boolean | null,
                    labelTextColor: number,
                    labelStrokeColor: number
                },
                callbacks: AnnotationCallbacks
            ) => {
                annotationCallbacks.current.set(annotationId, callbacks);
                mapViewContext.addAnnotation(annotationLayerId.current!, annotationId, {
                    title: annotation.title ?? null,
                    iconAsset: annotation.iconAsset ?? null,
                    coordinates: annotation.coordinates,
                    isSelected: annotation.isSelected,
                    labelTextColor: annotation.labelTextColor,
                    labelStrokeColor: annotation.labelStrokeColor,
                });
            },
            updateAnnotation: (
                annotationId: number,
                annotation: {
                    title?: string | null | undefined,
                    iconAsset?: string | null | undefined,
                    coordinates: [number, number],
                    isSelected: boolean | null,
                    labelTextColor: number,
                    labelStrokeColor: number
                }
            ) => {
                mapViewContext.updateAnnotation(annotationLayerId.current, annotationId, {
                    title: annotation.title ?? null,
                    iconAsset: annotation.iconAsset ?? null,
                    coordinates: annotation.coordinates,
                    isSelected: annotation.isSelected,
                    labelTextColor: annotation.labelTextColor,
                    labelStrokeColor: annotation.labelStrokeColor,
                });
            },
            removeAnnotation: (annotationId: number) => {
                annotationCallbacks.current.delete(annotationId);
                mapViewContext.removeAnnotation(annotationLayerId.current, annotationId);
            },
        }
    ), [mapViewContext]);

    useEffect(() => {
        const layerId = annotationLayerId.current;
        mapViewContext.addAnnotationLayer(layerId, {
            onAnnotationSelected(annotationId) {
                annotationCallbacks.current.get(annotationId)?.onSelected();
            },
            onAnnotationDeselected(annotationId) {
                annotationCallbacks.current.get(annotationId)?.onDeselected();
            },
        });

        setAnnotationLayerCreated(true);

        return () => {
            mapViewContext.removeAnnotationLayer(layerId);
        };
    }, [mapViewContext]);

    return (
        <CoordinateAnnotationLayerContext value={coordinateAnnotationLayerFunctions}>
            {annotationLayerCreated && children}
        </CoordinateAnnotationLayerContext>
    );
}
