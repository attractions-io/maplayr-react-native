import { useEffect, useContext, useRef, memo } from 'react';
import { CoordinateAnnotationLayerContext } from './CoordinateAnnotationLayerContext';
import { Image, processColor } from 'react-native';

let currentAnnotationId = 0;

function getNextAnnotationId(): number {
    return ++currentAnnotationId;
}

export type LabelStyle = {
    color?: string;
    textStrokeColor?: string;
}

const DEFAULT_LABEL_COLOR = '#E39E2A'; // Orange/amber color
const DEFAULT_LABEL_STROKE_COLOR = '#000000'; // Black

export type LabeledAnnotationIconProps = {
    title?: string,
    icon?: number,
    coordinates: { latitude: number, longitude: number },
    isSelected?: boolean,
    labelStyle?: LabelStyle,
    onSelected?: () => void;
    onDeselected?: () => void;
}

function LabeledAnnotationIconImpl(props: LabeledAnnotationIconProps) {

    const annotationIdRef = useRef<number>(getNextAnnotationId());
    const hasBeenAddedRef = useRef<boolean>(false);

    const coordinateAnnotationLayerContext = useContext(CoordinateAnnotationLayerContext);

    useEffect(() => {
        const iconAsset = props.icon ? JSON.stringify(Image.resolveAssetSource(props.icon)) : null;

        const annotation = {
            title: props.title ?? null,
            iconAsset,
            coordinates: [props.coordinates.latitude, props.coordinates.longitude] as [number, number],
            isSelected: props.isSelected ?? null,
            labelTextColor: processColor(props.labelStyle?.color ?? DEFAULT_LABEL_COLOR) as number,
            labelStrokeColor: processColor(props.labelStyle?.textStrokeColor ?? DEFAULT_LABEL_STROKE_COLOR) as number,
        };

        if (!hasBeenAddedRef.current) {
            coordinateAnnotationLayerContext.addAnnotation(
                annotationIdRef.current,
                annotation,
                {
                    onSelected() {
                        props.onSelected?.();
                    },
                    onDeselected() {
                        props.onDeselected?.();
                    },
                }
            );
            hasBeenAddedRef.current = true;
        } else {
            coordinateAnnotationLayerContext.updateAnnotation(
                annotationIdRef.current,
                annotation
            );
        }
    }, [
        coordinateAnnotationLayerContext,
        props,
    ]);

    useEffect(() => {
        const annotationId = annotationIdRef.current;
        return () => {
            coordinateAnnotationLayerContext.removeAnnotation(annotationId);
        };
    }, [coordinateAnnotationLayerContext]);

    return null;
}

export const LabeledAnnotationIcon = memo(LabeledAnnotationIconImpl, (prev, next) => {
  return (
    prev.title === next.title &&
    prev.icon === next.icon &&
    prev.coordinates.latitude === next.coordinates.latitude &&
    prev.coordinates.longitude === next.coordinates.longitude &&
    prev.isSelected === next.isSelected &&
    prev.labelStyle?.color === next.labelStyle?.color &&
    prev.labelStyle?.textStrokeColor === next.labelStyle?.textStrokeColor
  );
});
