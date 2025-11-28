import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps, HostComponent } from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';

/**
 * Props for the MapView component.
 */
export interface MapViewProps extends ViewProps {

  map : { id: string, version: string }; // It's a shame I can't specify the `Map` class here. Codegen doesn't support it. or even a typealias here.
  onAnnotationSelected? : DirectEventHandler<{ annotationLayerId: Int32, annotationId: Int32 }> | null;
  onAnnotationDeselected? : DirectEventHandler<{ annotationLayerId: Int32, annotationId: Int32 }> | null;
}

export default codegenNativeComponent<MapViewProps>('ReactNativeMapView');

interface NativeCommands {

  addAnnotationLayer: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    annotationLayerId: Int32
  ) => void;

  removeAnnotationLayer: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    annotationLayerId: Int32
  ) => void;

  addAnnotation: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    annotationLayerId: Int32,
    annotationId: Int32,
    annotationJson: string
  ) => void;

  updateAnnotation: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    annotationLayerId: Int32,
    annotationId: Int32,
    annotationJson: string
  ) => void;

  removeAnnotation: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    annotationLayerId: Int32,
    annotationId: Int32,
  ) => void;

  addUserLocationMarker: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    markerId: Int32,
    userLocationJson: string
  ) => void;

  updateUserLocationMarker: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    markerId: Int32,
    userLocationJson: string
  ) => void;

  removeUserLocationMarker: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    markerId: Int32,
  ) => void;

  addShape: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    shapeId: Int32,
    shapeJson: string
  ) => void;

  updateShape: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    shapeId: Int32,
    shapeJson: string
  ) => void;

  removeShape: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    shapeId: Int32,
  ) => void;

  moveCamera: (
    mapViewRef: React.ElementRef<HostComponent<MapViewProps>>,
    cameraPositionJson: string
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'addAnnotationLayer',
    'removeAnnotationLayer',
    'addAnnotation',
    'updateAnnotation',
    'removeAnnotation',
    'addUserLocationMarker',
    'updateUserLocationMarker',
    'removeUserLocationMarker',
    'addShape',
    'updateShape',
    'removeShape',
    'moveCamera',
  ],
});
