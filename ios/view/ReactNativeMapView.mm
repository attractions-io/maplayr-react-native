#import "ReactNativeMapView.h"
#import "ReactNativeMapLayr/ReactNativeMapLayr-Swift.h"

#import "../generated/MapLayrSpec/ComponentDescriptors.h"
#import "../generated/MapLayrSpec/EventEmitters.h"
#import "../generated/MapLayrSpec/Props.h"
#import "../generated/MapLayrSpec/RCTComponentViewHelpers.h"

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface ReactNativeMapView () <RCTReactNativeMapViewViewProtocol>

@end

@implementation ReactNativeMapView {
    ReactNativeMapViewWrapper * _mapViewWrapper;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<ReactNativeMapViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const ReactNativeMapViewProps>();
        _props = defaultProps;
        
        _mapViewWrapper = [[ReactNativeMapViewWrapper alloc] initWithFrame:frame];
        
        self.contentView = _mapViewWrapper;
        
        __weak ReactNativeMapView *weakSelf = self;
        
		_mapViewWrapper.selectAnnotationEvent = ^ (NSInteger layerId, NSInteger annotationId) {
            __strong ReactNativeMapView *strongSelf = weakSelf;
            if (!strongSelf) return;
			
			auto eventEmitter = std::static_pointer_cast<const ReactNativeMapViewEventEmitter>(strongSelf->_eventEmitter);
			
			ReactNativeMapViewEventEmitter::OnAnnotationSelected event = {
				.annotationLayerId = static_cast<int>(layerId),
				.annotationId = static_cast<int>(annotationId)
			};
			
			eventEmitter->onAnnotationSelected(event);
		};
		
		_mapViewWrapper.deselectAnnotationEvent = ^ (NSInteger layerId, NSInteger annotationId) {
            __strong ReactNativeMapView *strongSelf = weakSelf;
            if (!strongSelf) return;
			
			auto eventEmitter = std::static_pointer_cast<const ReactNativeMapViewEventEmitter>(strongSelf->_eventEmitter);
			
			ReactNativeMapViewEventEmitter::OnAnnotationDeselected event = {
				.annotationLayerId = static_cast<int>(layerId),
				.annotationId = static_cast<int>(annotationId)
			};
			
			eventEmitter->onAnnotationDeselected(event);
		};
    }
    
    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<ReactNativeMapViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<ReactNativeMapViewProps const>(props);
    
    if (oldViewProps.map.id != newViewProps.map.id || oldViewProps.map.version != newViewProps.map.version) {
        NSString *mapId = [NSString stringWithUTF8String:newViewProps.map.id.c_str()];
        NSString *version = [NSString stringWithUTF8String:newViewProps.map.version.c_str()];
        [_mapViewWrapper setMapDataWithMapId:mapId version:version];
    }
    
    [super updateProps:props oldProps:oldProps];
}

- (void)handleCommand:(nonnull const NSString *)commandName args:(nonnull const NSArray *)args {
    RCTReactNativeMapViewHandleCommand(self, commandName, args);
}

- (void)addAnnotationLayer:(NSInteger)annotationLayerId {
	auto eventEmitter = std::static_pointer_cast<const ReactNativeMapViewEventEmitter>(_eventEmitter);
	
    [_mapViewWrapper addAnnotationLayerWithAnnotationLayerId:annotationLayerId];
}

- (void)removeAnnotationLayer:(NSInteger)annotationLayerId {
    [_mapViewWrapper removeAnnotationLayerWithAnnotationLayerId:annotationLayerId];
}

- (void)addAnnotation:(NSInteger)annotationLayerId annotationId:(NSInteger)annotationId annotationJson:(nonnull NSString *)annotationJson {
    [_mapViewWrapper addAnnotationWithAnnotationLayerId:annotationLayerId annotationId:annotationId annotationJson:annotationJson];
}

- (void)updateAnnotation:(NSInteger)annotationLayerId annotationId:(NSInteger)annotationId annotationJson:(nonnull NSString *)annotationJson {
	[_mapViewWrapper updateAnnotationWithAnnotationLayerId:annotationLayerId annotationId:annotationId annotationJson:annotationJson];
}

- (void)removeAnnotation:(NSInteger)annotationLayerId annotationId:(NSInteger)annotationId {
    [_mapViewWrapper removeAnnotationWithAnnotationLayerId:annotationLayerId annotationId:annotationId];
}

- (void)addUserLocationMarker:(NSInteger)markerId userLocationJson:(nonnull NSString *)userLocationJson {
	[_mapViewWrapper addUserLocationMarkerWithMarkerId:markerId userLocationJson:userLocationJson];
}

- (void)updateUserLocationMarker:(NSInteger)markerId userLocationJson:(nonnull NSString *)userLocationJson {
	[_mapViewWrapper updateUserLocationMarkerWithMarkerId:markerId userLocationJson:userLocationJson];
}

- (void)removeUserLocationMarker:(NSInteger)markerId {
	[_mapViewWrapper removeUserLocationMarkerWithMarkerId:markerId];
}

- (void)addShape:(NSInteger)shapeId shapeJson:(NSString *)shapeJson {
	[_mapViewWrapper addShapeWithShapeId:shapeId json:shapeJson];
}

- (void)updateShape:(NSInteger)shapeId shapeJson:(NSString *)shapeJson {
	[_mapViewWrapper updateShapeWithShapeId:shapeId json:shapeJson];
}

- (void)removeShape:(NSInteger)shapeId {
	[_mapViewWrapper removeShapeWithShapeId:shapeId];
}

- (void)moveCamera:(NSString *)cameraPositionJson {
	[_mapViewWrapper moveCameraWithJson:cameraPositionJson];
}

@end
