import UIKit
import MapLayr
import React

@objc
public class ReactNativeMapViewWrapper : UIView {
	
    // TODO:- It would be nicer if these were in a single state.
    // AnnotationLayerId -> [CoordinateAnnotationLayer -> [AnnotationId: LabeledAnnotationIconData]]
    private var annotationLayers: [Int:CoordinateAnnotationLayer<LabeledAnnotationIconInstance>] = [:]
    private var annotations: [Int:LabeledAnnotationIconInstance] = [:]
    private var userLocationMarkers: [Int: UserLocationMarker] = [:]
	private var shapes: [Int:ShapeEntry] = [:]

    private let mapView : MapView
	
	@objc public var selectAnnotationEvent: (Int, Int) -> Void = { _, _ in }
	@objc public var deselectAnnotationEvent: (Int, Int) -> Void = { _, _ in }
    
    @objc
    override public init(frame: CGRect) {
        self.mapView = MapView(frame: frame)
        super.init(frame: frame)
        self.addSubview(mapView)
    }
    
    required init?(coder: NSCoder) {
        fatalError("NSCoder init is not supported")
    }
    
    @objc
    public func setMapData(mapId: String, version: String) {
        let mapData = ManagedMapManager.shared.getMapData(mapId: mapId, version: version)
        mapView.mapData = mapData
    }
    
    public override func layoutSubviews() {
        super.layoutSubviews()
        
        mapView.frame = bounds
    }
    
    @objc
    public func addAnnotationLayer(
		annotationLayerId: Int
	) {
        func annotationView(instance: LabeledAnnotationIconInstance.Data) -> CoordinateAnnotationView {
            var icon: UIImage?
            if  let iconAsset = instance.iconAsset,
                let data = iconAsset.data(using: .utf8),
                let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
            {
                icon = RCTConvert.uiImage(json)
            }
            
            let annotation = LabeledAnnotationIcon(
                icon: icon,
                text: instance.title
            )
            
            annotation.label.textColor = decodeReactColorInt(instance.labelTextColor)!
            annotation.label.highlightedTextColor = #colorLiteral(red: 1, green: 1, blue: 1, alpha: 1)
            
            annotation.label.textStrokeColor = decodeReactColorInt(instance.labelStrokeColor)!
            
            annotation.label.textStrokeWidth = 3
            
            annotation.label.font = UIFontMetrics(forTextStyle: .caption1).scaledFont(for: .systemFont(ofSize: 9, weight: .heavy))
            annotation.label.adjustsFontForContentSizeCategory = true
            
            return annotation
        }
        
        let annotationLayer = CoordinateAnnotationLayer<LabeledAnnotationIconInstance>(
			coordinates: \.data.coordinates,
			view: { annotationView(instance: $0.data) }
        )
		
		annotationLayer.delegate = self
        
        annotationLayers[annotationLayerId] = annotationLayer
        
        mapView.addMapLayer(annotationLayer)
    }
    
    @objc
    public func removeAnnotationLayer(annotationLayerId: Int) {
        // TODO:- Should it be completely empty of annotations or not?
        // TODO:- It would be better if the iOS SDK included a method to delete a given layer rather than having to specify an ID.
		
		guard let annotationLayer = annotationLayers[annotationLayerId] else {
			// TODO:- Throw ?
			print("ReactNativeSDK | ERROR | removeAnnotationLayer | annotationLayer is nil!")
			return
		}
		
		guard let index = mapView.mapLayers.firstIndex(where: { $0 === annotationLayer }) else {
			return
		}
		
		mapView.removeMapLayer(at: index)
		
		let elements = annotationLayer.elements
		annotations = annotations.filter { (_, annotation) in !elements.contains(annotation) }
    }
	
	private let decoder = JSONDecoder()
	
	private func loadAnnotationData(json: String) throws -> LabeledAnnotationIconInstance.Data {
		try decoder.decode(LabeledAnnotationIconInstance.Data.self, from: json.data(using: .utf8)!)
	}
    
    @objc
    public func addAnnotation(annotationLayerId: Int, annotationId: Int, annotationJson: String) {
        guard let annotationLayer = annotationLayers[annotationLayerId] else {
            // TODO:- Throw ?
            print("ReactNativeSDK | ERROR | addAnnotation | annotationLayer is nil!")
            return
        }
		
		let labeledAnnotationIconData = try! loadAnnotationData(json: annotationJson)
        let instance = LabeledAnnotationIconInstance(id: annotationId, data: labeledAnnotationIconData)
		
        annotations[annotationId] = instance
        annotationLayer.insert(instance)
    }
    
    @objc
    public func updateAnnotation(annotationLayerId: Int, annotationId: Int, annotationJson: String) {
		guard let annotationLayer = annotationLayers[annotationLayerId] else {
			// TODO:- Throw ?
			print("ReactNativeSDK | ERROR | updateAnnotation | annotationLayer is nil!")
			return
		}
		
		guard let annotation = annotations[annotationId] else {
			// TODO:- Throw ?
			print("ReactNativeSDK | ERROR | updateAnnotation | annotation is nil!")
			return
		}
		
		let labeledAnnotationIconData = try! loadAnnotationData(json: annotationJson)
		annotation.data = labeledAnnotationIconData
		
		if let view = annotationLayer.view(for: annotation) as? LabeledAnnotationIcon {
			view.label.text = labeledAnnotationIconData.title
            
			view.label.textColor = decodeReactColorInt(labeledAnnotationIconData.labelTextColor)!
            view.label.highlightedTextColor = view.label.textColor
            
			view.label.textStrokeColor = decodeReactColorInt(labeledAnnotationIconData.labelStrokeColor)!
            view.label.highlightedTextStrokeColor = view.label.textStrokeColor
            
			if
				let iconAssetData = labeledAnnotationIconData.iconAsset,
				let data = iconAssetData.data(using: .utf8),
				let json = try? JSONSerialization.jsonObject(with: data) as? [String:Any]
			{
				view.imageView.image = RCTConvert.uiImage(json)
			} else {
				view.imageView.image = nil
			}
			
			view.setNeedsLayout()
		}
		
		annotationLayer.updateCoordinate(of: annotation)
    }
    
    @objc
    public func removeAnnotation(annotationLayerId: Int, annotationId: Int) {
        guard let annotationLayer = annotationLayers[annotationLayerId] else {
            // TODO:- Throw ?
            print("ReactNativeSDK | ERROR | removeAnnotation | annotationLayer is nil!")
            return
        }
        
        guard let annotation = annotations[annotationId] else {
            // TODO:- Throw ?
            print("ReactNativeSDK | ERROR | removeAnnotation | annotation is nil!")
            return
        }
        
        annotationLayer.remove(annotation)
		// TODO: Delete annotation from list?
    }

    // MARK: - User Location Marker

	private struct UserLocationMarkerData: Decodable {
		var tintColor: UInt32?
		var location: LocationOverride?
		var heading: HeadingOverride?

		struct LocationOverride: Decodable {
			var coordinates: Coordinates
			var horizontalAccuracy: Double?
		}

		struct HeadingOverride: Decodable {
			var direction: Double
			var accuracy: Double
		}
	}

	private func loadUserLocationMarkerData(json: String) throws -> UserLocationMarkerData {
		try decoder.decode(UserLocationMarkerData.self, from: json.data(using: .utf8)!)
	}

    @objc
    public func addUserLocationMarker(markerId: Int, userLocationJson: String) {
		let data = try! loadUserLocationMarkerData(json: userLocationJson)

        let decodedColor: UIColor?
		if let color = data.tintColor {
			decodedColor = decodeReactColorInt(color)
		} else {
			decodedColor = nil
		}

		let location: UserLocationMarker.PositionMode
		if let overrideLocation = data.location {
			location = .fixed(Position(
				coordinates: MultilevelCoordinates(coordinates: overrideLocation.coordinates),
				horizontalAccuracy: overrideLocation.horizontalAccuracy ?? 0,
				timestamp: Date()
			))
		} else {
			let sensor = SystemPositionSensor()
			sensor.isUpdatingPosition = true
			location = .provider(sensor)
		}

		let heading: UserLocationMarker.HeadingMode
		if let overrideHeading = data.heading {
//			heading = .fixed(Heading()) // TODO
//			heading = (overrideHeading.direction, overrideHeading.accuracy) // Old
			
			let sensor = SystemHeadingSensor()
			sensor.isUpdatingHeading = true
			heading = .provider(sensor)
		} else {
			let sensor = SystemHeadingSensor()
			sensor.isUpdatingHeading = true
			heading = .provider(sensor)
		}

		let locationMarker = UserLocationMarker(
			position: location,
			heading: heading
		)

		if let decodedColor {
			locationMarker.tintColor = decodedColor
		}

        userLocationMarkers[markerId] = locationMarker

        mapView.addUserLocationMarker(locationMarker)
    }

    @objc
    public func updateUserLocationMarker(markerId: Int, userLocationJson: String) {
		let data = try! loadUserLocationMarkerData(json: userLocationJson)
		
		let decodedColor: UIColor?
		if let color = data.tintColor {
			decodedColor = decodeReactColorInt(color)
		} else {
			decodedColor = nil
		}
		
        guard let locationMarker = userLocationMarkers[markerId] else {
            print("ReactNativeSDK | ERROR | updateUserLocationMarker | markerId not found!")
            return
        }
		
		if let overrideLocation = data.location {
			locationMarker.positionMode = .fixed(Position(
				coordinates: MultilevelCoordinates(coordinates: overrideLocation.coordinates),
				horizontalAccuracy: overrideLocation.horizontalAccuracy ?? 0,
				timestamp: Date()
			))
		} else {
			let sensor = SystemPositionSensor()
			sensor.isUpdatingPosition = true
			locationMarker.positionMode = .provider(sensor)
		}
		
		if let overrideHeading = data.heading {
			//			heading = .fixed(Heading()) // TODO
			//			heading = (overrideHeading.direction, overrideHeading.accuracy) // Old
			let sensor = SystemHeadingSensor()
			sensor.isUpdatingHeading = true
			locationMarker.headingMode = .provider(sensor)
		} else {
			let sensor = SystemHeadingSensor()
			sensor.isUpdatingHeading = true
			locationMarker.headingMode = .provider(sensor)
		}
		
		if let decodedColor {
			locationMarker.tintColor = decodedColor
		} else {
			locationMarker.tintColor = #colorLiteral(red: 0, green: 0.4784313725, blue: 1, alpha: 1)
		}
    }

    @objc
    public func removeUserLocationMarker(markerId: Int) {
        guard let locationMarker = userLocationMarkers.removeValue(forKey: markerId) else {
            print("ReactNativeSDK | ERROR | removeUserLocationMarker | markerId not found!")
            return
        }

		mapView.removeUserLocationMarker(locationMarker)
    }
	
	private struct ShapeDetails: Decodable {
		var routeId: UUID
		var strokeWidth: Double
		var strokeColor: UInt32
		var order: Int
	}
	
	private final class ShapeEntry {
		var shapeId: Int
		var shape: Shape?
		var order: Int
		
		init(shapeId: Int, shape: Shape?, order: Int) {
			self.shapeId = shapeId
			self.shape = shape
			self.order = order
		}
		
		static func < (lhs: ShapeEntry, rhs: ShapeEntry) -> Bool {
			lhs.order < rhs.order
		}
	}
	
	@objc
	public func addShape(shapeId id: Int, json: String) {
		let details = try! JSONDecoder().decode(ShapeDetails.self, from: json.data(using: .utf8)!)
		
		guard let route = ManagedMapManager.shared.activeRoutes[details.routeId] else {
			return
		}
		
		let shape: Shape?
		if let path = route.route?.path {
			shape = Shape(
				path: path,
				strokeColor: decodeReactColorInt(details.strokeColor)!.cgColor,
				strokeWidth: details.strokeWidth
			)
		} else {
			shape = nil
		}
		
		shapes[id] = ShapeEntry(
			shapeId: id,
			shape: shape,
			order: details.order
		)
		
		updateShapes()
	}
	
	@objc
	public func updateShape(shapeId id: Int, json: String) {
		let details = try! JSONDecoder().decode(ShapeDetails.self, from: json.data(using: .utf8)!)
		
		guard let route = ManagedMapManager.shared.activeRoutes[details.routeId] else {
			return
		}
		
		guard let shape = shapes[id] else {
			return
		}
		
		if let path = route.route?.path {
			let strokeColor = decodeReactColorInt(details.strokeColor)!.cgColor
			
			if let shape = shape.shape {
				shape.path = path
				shape.strokeColor = strokeColor
				shape.strokeWidth = details.strokeWidth
			} else {
				shape.shape = Shape(
					path: path,
					strokeColor: strokeColor,
					strokeWidth: details.strokeWidth
				)
			}
		} else {
			shape.shape = nil
		}
		
		shape.order = details.order
		
		updateShapes()
	}
	
	@objc
	public func removeShape(shapeId id: Int) {
		shapes.removeValue(forKey: id)
		
		updateShapes()
	}
	
	private func updateShapes() {
		mapView.shapes = shapes.values.sorted(by: <).compactMap(\.shape)
	}
	
	@objc
	public func moveCamera(json: String) {
		struct Location: Decodable {
			let latitude: Double
			let longitude: Double
			
			var coordinates: Coordinates {
				Coordinates(latitude: latitude, longitude: longitude)
			}
		}

		struct Payload: Decodable {
			let locations: [Location] // Normalized to an array regardless of single or multiple input
			let routeId: UUID?
			let heading: Double?
			let span: Double?
			let insets: Double?
			let tilt: Float?
			let animated: Bool

			enum CodingKeys: String, CodingKey {
				case location
				case route
				case heading
				case span
				case insets
				case tilt
				case animated
			}

			init(from decoder: Decoder) throws {
				let container = try decoder.container(keyedBy: CodingKeys.self)

				if let single = try? container.decode(Location.self, forKey: .location) {
					self.locations = [single]
				} else {
					self.locations = try container.decodeIfPresent([Location].self, forKey: .location) ?? []
				}
        
				self.routeId = try container.decode(UUID?.self, forKey: .route)
				self.heading = try container.decodeIfPresent(Double.self, forKey: .heading)
				self.span = try container.decodeIfPresent(Double.self, forKey: .span)
				self.insets = try container.decodeIfPresent(Double.self, forKey: .insets)
				self.tilt = try container.decodeIfPresent(Float.self, forKey: .tilt)
				self.animated = try container.decodeIfPresent(Bool.self, forKey: .animated) ?? false
			}
		}
		
		let payload = try! decoder.decode(Payload.self, from: Data(json.utf8))
		
		let center: Coordinates?
		let span: Distance?
		
		let coordinates: [Coordinates]
		
		if let routeId = payload.routeId {
			guard let route = ManagedMapManager.shared.activeRoutes[routeId] else {
				return
			}
			
			coordinates = route.route?.path.subpaths.flatMap { subpath in
				[
					subpath.startingPosition.coordinates(using: .webMercator)
				] + subpath.segments.map { segment in
					segment.destination.coordinates(using: .webMercator)
				}
			} ?? []
		} else {
			coordinates = payload.locations.map(\.coordinates)
		}
		
		switch coordinates.count {
		case 0:
			center = nil
			span = payload.span
			
		case 1:
			center = coordinates[0]
			span = payload.span
			
		default:
			(center, span) = computeSmallestCircle(coordinates: coordinates)!
		}
		
		mapView.moveCamera(
			coordinates: center,
			heading: payload.heading,
			span: span,
			insets: payload.insets ?? 0,
			tilt: payload.tilt,
			animated: payload.animated
		)
	}

    // MARK: - Helpers

    // React Native encodes colors as ARGB integers on iOS.
    // This converts an Int ARGB into a UIColor. Treat 0 as "no color provided"; negative values are valid ARGB.
    private func decodeReactColorInt(_ argb: UInt32) -> UIColor? {
        if argb == 0 { return nil }
        let a = CGFloat((argb >> 24) & 0xFF) / 255.0
        let r = CGFloat((argb >> 16) & 0xFF) / 255.0
        let g = CGFloat((argb >> 8) & 0xFF) / 255.0
        let b = CGFloat(argb & 0xFF) / 255.0
        return UIColor(red: r, green: g, blue: b, alpha: a)
    }
}

extension ReactNativeMapViewWrapper: CoordinateAnnotationLayerDelegate {
	public func didSelectAnnotation(_ element: LabeledAnnotationIconInstance, in annotationLayer: CoordinateAnnotationLayer<LabeledAnnotationIconInstance>) {
		let layerId = annotationLayers.first(where: { $0.value === annotationLayer })?.key
		
		guard let layerId else {
			return
		}
		
		let annotationId = element.id
		
		selectAnnotationEvent(layerId, annotationId)
	}
	
	public func didDeselectAnnotation(_ element: LabeledAnnotationIconInstance, in annotationLayer: CoordinateAnnotationLayer<LabeledAnnotationIconInstance>) {
		let layerId = annotationLayers.first(where: { $0.value === annotationLayer })?.key
		
		guard let layerId else {
			return
		}
		
		let annotationId = element.id
		
		deselectAnnotationEvent(layerId, annotationId)
	}
}
