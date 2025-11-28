#import "NativeMap.h"
#import <Foundation/Foundation.h>
#import "ReactNativeMapLayr/ReactNativeMapLayr-Swift.h"

@implementation NativeMap

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params { 
    return std::make_shared<facebook::react::NativeMapSpecJSI>(params);
}

- (void)subscribeToUpdatesForMap:(nonnull NSString *)mapId {
    [[ManagedMapManager shared] subscribeToUpdatesForMapWithMapId:mapId observer:^(NSString * _Nonnull mapId, NSString * version, NSString * error) {
        [self emitOnMapUpdate:(@{
            @"status": version ? @"success" : @"error",
            @"mapId": mapId,
            @"version": version ?: [NSNull null],
            @"error": error ?: [NSNull null]
        })];
    }];
}

- (void)unSubscribeToUpdatesForMap:(nonnull NSString *)mapId {
    [[ManagedMapManager shared] unSubscribeToUpdatesForMapWithMapId:mapId];
}

- (NSString *)createRoute:(nonnull NSString *)params {
    NSLog(@"createRoute called with params: %@", params);
	return [[ManagedMapManager shared] createRouteWithParamsJson:params];
}

- (void)cancelRoute:(nonnull NSString *)routeId {
    NSLog(@"cancelRoute called with routeId: %@", routeId);
    [[ManagedMapManager shared] cancelRouteWithRouteId:routeId];
}

- (NSString *)startLocationUpdates {
	return [[ManagedMapManager shared] startLocationUpdatesWithObserver:^(NSString * _Nonnull locationId, NSString *json) {
		[self emitOnLocationUpdate:@{
			@"locationId": locationId,
			@"location": json ?: [NSNull null]
		}];
	}];
}

- (void)stopLocationUpdates:(NSString *)locationId {
	[[ManagedMapManager shared] stopLocationUpdatesWithId:locationId];
}

+ (NSString *)moduleName
{
  return @"NativeMap";
}

@end
