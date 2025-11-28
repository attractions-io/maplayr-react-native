import Foundation
import MapLayr
import Combine

struct RouteParams: Decodable {
    let mapId: String
	let versionId: String
    let origin: Coordinates
    let destination: [Coordinates]
    let options: RouteOptionParameters
}

struct RouteOptionParameters: Decodable {
	var avoidFlags: [String]?
	var attachEndpointsToAllowedPathsOnly: Bool?
	var originSpurStrategy: String?
	var destinationSpurStrategy: String?
	
	func toRouteOptions() -> PathNetwork.RouteOptions {
		var options = PathNetwork.RouteOptions.none
		
		options.avoidFlags = Set((avoidFlags ?? []).map { PathGraph.Edge.Flag(key: $0) })
		options.attachEndpointsToAllowedPathsOnly = attachEndpointsToAllowedPathsOnly ?? false
		
		options.originSpurStrategy = decodeSpurStrategy(originSpurStrategy)
		options.destinationSpurStrategy = decodeSpurStrategy(destinationSpurStrategy)
		
		return options
	}
	
	private func decodeSpurStrategy(_ strategy: String?) -> PathNetwork.RouteOptions.EndpointSpurStrategy {
		guard let strategy else {
			return .curved
		}
		
		switch strategy {
		case "curved":
			return .curved
		case "straight":
			return .straight
		case "none":
			return .none
		default:
			return .curved
		}
	}
}

struct RouteResponse: Encodable {
    let success: Bool
    let routeId: String?
    let route: Route?
    let error: String?
	
	init(success: Bool, routeId: String?, route: Route?, error: String?) {
		self.success = success
		self.routeId = routeId
		self.route = route
		self.error = error
	}
	
	enum CodingKeys: CodingKey {
		case success
		case routeId
		case route
		case error
	}
	
	enum RouteCodingKeys: CodingKey {
		case distance
	}
	
	func encode(to encoder: any Encoder) throws {
		var container = encoder.container(keyedBy: CodingKeys.self)
		
		try container.encode(success, forKey: .success)
		try container.encode(routeId, forKey: .routeId)
		try container.encode(error, forKey: .error)
		
		var routeContainer = container.nestedContainer(keyedBy: RouteCodingKeys.self, forKey: .route)
		
		try routeContainer.encode(route?.distance, forKey: .distance)
	}
}

@objc
public class ManagedMapManager : NSObject {
    
    @objc
    public static let shared = ManagedMapManager()
    
    private var managedMapStates: [String:ManagedMapState] = [:]
    var activeRoutes: [UUID:ActiveRoute] = [:]
	
	final class ActiveRoute {
		var route: Route?
		
		init(route: Route?) {
			self.route = route
		}
	}
    
    private override init() {}
    
    @objc
    public func subscribeToUpdatesForMap(mapId: String, observer: @escaping (String, String?, String?) -> Void) {
        DispatchQueue.main.async {
			if self.managedMapStates[mapId] == nil {
				let managedMapState = ManagedMapState(mapId: mapId, observer: observer)
				self.managedMapStates[mapId] = managedMapState
			}
        }
    }
    
    @objc
    public func unSubscribeToUpdatesForMap(mapId: String) {
        DispatchQueue.main.async {
			self.managedMapStates.removeValue(forKey: mapId)
        }
    }
    
    // This will be called on the main thread so no synchronisation required
    public func getMapData(mapId: String, version: String) -> MapData? {
		managedMapStates[mapId]?.getMapData(version: version)
    }

    @objc
    public func createRoute(paramsJson: String) -> String {
        do {
            // Parse the JSON parameters
            let jsonData = paramsJson.data(using: .utf8)!
            let params = try JSONDecoder().decode(RouteParams.self, from: jsonData)

            // Check if map is loaded
            guard let mapState = managedMapStates[params.mapId],
                  let mapData = mapState.getMapData(version: params.versionId) else {
                let errorResponse = RouteResponse(success: false, routeId: nil, route: nil, error: "Map not loaded or available")
                let responseData = try JSONEncoder().encode(errorResponse)
                return String(data: responseData, encoding: .utf8)!
            }
			
			guard let pathNetwork = mapData.pathNetwork else {
				let errorResponse = RouteResponse(success: false, routeId: nil, route: nil, error: "Routes not available for this map")
				let responseData = try JSONEncoder().encode(errorResponse)
				return String(data: responseData, encoding: .utf8)!
			}
			
			let routeId = UUID()
			
			let response: RouteResponse
			if let route = pathNetwork.calculateDirections(from: params.origin, to: params.destination, options: params.options.toRouteOptions()) {
				response = RouteResponse(success: true, routeId: routeId.uuidString, route: route, error: nil)
			} else {
				response = RouteResponse(success: true, routeId: routeId.uuidString, route: nil, error: "Route is not possible")
			}
			
			activeRoutes[routeId] = ActiveRoute(route: response.route)
			
			let responseData = try JSONEncoder().encode(response)
			return String(data: responseData, encoding: .utf8)!
			
        } catch let decodingError as DecodingError {
            let errorResponse = RouteResponse(success: false, routeId: nil, route: nil, error: "Invalid parameters: \(decodingError.localizedDescription)")
            let responseData = try! JSONEncoder().encode(errorResponse)
            return String(data: responseData, encoding: .utf8)!
			
        } catch {
            let errorResponse = RouteResponse(success: false, routeId: nil, route: nil, error: "Unexpected error: \(error.localizedDescription)")
            let responseData = try! JSONEncoder().encode(errorResponse)
            return String(data: responseData, encoding: .utf8)!
        }
    }

    @objc
    public func cancelRoute(routeId: String) {
        DispatchQueue.main.async {
            self.activeRoutes.removeValue(forKey: UUID(uuidString: routeId)!)
        }
    }
	
	private struct UpdateLocationResponse: Encodable {
		var latitude: Double
		var longitude: Double
		var horizontalAccuracy: Double
	}
	
	private struct StartLocationResponse: Encodable {
		var id: UUID
		var location: UpdateLocationResponse?
	}
	
	var activeLocationSensor: SystemPositionSensor?
	var activeLocationObserver: (any Cancellable)?
	
	var activeLocationObservers: Set<UUID> = Set()
	
	@objc
	public func startLocationUpdates(observer: @escaping (String, String?) -> Void) -> String {
		let newObserver = UUID()
		
		if activeLocationSensor == nil {
			let sensor = SystemPositionSensor()
			sensor.isUpdatingPosition = true
			
			activeLocationObserver = sensor.positions.sink { [weak self] position in
				guard let self else {
					return
				}
				
				let packet = position.map { position in
					let response = UpdateLocationResponse(latitude: position.coordinates.latitude, longitude: position.coordinates.longitude, horizontalAccuracy: position.horizontalAccuracy)
					return String(data: try! JSONEncoder().encode(response), encoding: .utf8)!
				}
				
				for id in activeLocationObservers {
					observer(id.uuidString, packet)
				}
			}
			
			activeLocationSensor = sensor
		}
		
		activeLocationObservers.insert(newObserver)
		
		let initialLocation: UpdateLocationResponse?
		if let currentLocation = activeLocationSensor?.current {
			initialLocation = UpdateLocationResponse(latitude: currentLocation.coordinates.latitude, longitude: currentLocation.coordinates.longitude, horizontalAccuracy: currentLocation.horizontalAccuracy)
		} else {
			initialLocation = nil
		}
		
		let response = StartLocationResponse(id: newObserver, location: initialLocation)
		return String(data: try! JSONEncoder().encode(response), encoding: .utf8)!
	}
	
	@objc
	public func stopLocationUpdates(id: String) {
		guard let id = UUID(uuidString: id) else {
			return
		}
		
		activeLocationObservers.remove(id)
		
		if activeLocationObservers.isEmpty {
			activeLocationSensor = nil
			activeLocationObserver = nil
		}
	}
}

private class ManagedMapState {
    
    let mapId: String
    private var mapDatas : [MapData] = []
    private var cancellable : AnyCancellable? = nil
    private let observer: (String, String?, String?) -> Void
    
    init(mapId: String, observer: @escaping (_ mapId: String, _ mapVersion: String?, _ errorMessage: String?) -> Void) {
        self.mapId = mapId
        self.observer = observer
        Task {
            do {
                let map = try await Map.managed(id: mapId)
				cancellable = await map.$currentVersion.sink { mapData in
                    self.mapDatas.append(mapData)
                    // TODO:- `!` should be safe since it is managed map.
                    observer(mapId, mapData.version!.uuidString, nil)
                }
            } catch Map.Error.invalidId {
                observer(mapId, nil, "Invalid Map Id")
            } catch Map.Error.invalidManifest {
                observer(mapId, nil, "Invalid Manifest")
            } catch Map.Error.mapBundleMissing {
                observer(mapId, nil, "Map Bundle Missing") // This shouldn't really happen in the async version I don't think.
            } catch {
                observer(mapId, nil, "\(error.localizedDescription)")
            }
        }
    }
    
    public func getMapData(version: String) -> MapData? {
        return mapDatas.first { mapData in
            mapData.version?.uuidString == version
        }
    }
    
    deinit {
        // TODO:- Do I need to do this?
        cancellable?.cancel()
    }
}
