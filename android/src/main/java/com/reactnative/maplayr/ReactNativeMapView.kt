package com.reactnative.maplayr

import android.content.Context
import android.util.AttributeSet
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.reactnative.maplayr.Utils.getNullableBoolean
import com.reactnative.maplayr.Utils.getNullableDouble
import com.reactnative.maplayr.Utils.getNullableInt
import com.reactnative.maplayr.Utils.getNullableObject
import com.reactnative.maplayr.Utils.getNullableString
import io.attractions.maplayr.MapView
import io.attractions.maplayr.androidLayer.annotation.CoordinateAnnotationLayer
import io.attractions.maplayr.context.MapVersionContext
import io.attractions.maplayr.model.opengl.locationmarker.LocationMarker
import io.attractions.maplayr.model.opengl.shapes.Shape
import io.attractions.positioning.google.GoogleLocationId
import io.attractions.positioning.model.coordinate.GeographicCoordinate
import io.attractions.positioning.model.coordinate.LevelId
import io.attractions.positioning.model.coordinate.Location
import org.json.JSONException
import org.json.JSONObject
import java.util.UUID

class ReactNativeMapView : FrameLayout {

    private val mapView: MapView

    private val annotationLayers: MutableMap<Int, CoordinateAnnotationLayerWithAnnotations> = mutableMapOf()
    private val locationMarkers: MutableMap<Int, LocationMarker> = mutableMapOf()
    private val shapes: MutableMap<Int, ShapeEntry> = mutableMapOf()

    constructor(context: Context) : super(context) {
        mapView = MapView(context, null)
        addView(mapView)
    }

    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
        mapView = MapView(context, attrs)
        addView(mapView)
    }

    constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr) {
        mapView = MapView(context, attrs)
        addView(mapView)
    }

    fun setMapVersionContext(mapVersionContext: MapVersionContext?) {
        mapView.setMapVersionContext(mapVersionContext)
    }

    fun addAnnotationLayer(annotationLayerId: Int) {
        if (annotationLayers.containsKey(annotationLayerId)) {
            throw Exception("ReactNativeMapLayrSDK | addAnnotationLayer | AnnotationLayerId $annotationLayerId already exists")
        }

        val adapter = LabeledAnnotationIconAnnotationLayerAdapter()
        val coordinateAnnotationLayer = CoordinateAnnotationLayer(context, adapter)
        coordinateAnnotationLayer.listener = object : CoordinateAnnotationLayer.Listener<LabeledAnnotationIconData> {

            override fun didSelectAnnotation(
                element: LabeledAnnotationIconData,
                coordinateAnnotationLayer: CoordinateAnnotationLayer<LabeledAnnotationIconData>
            ) {
                getAnnotationLayerId(coordinateAnnotationLayer)?.let { annotationLayerId ->
                    val payload = Arguments.createMap().apply {
                        putInt("annotationLayerId", annotationLayerId)
                        putInt("annotationId", element.id)
                    }
                    emitEvent(NativeEventType.OnAnnotationSelectedEvent, payload)
                }
            }

            override fun didDeselectAnnotation(
                element: LabeledAnnotationIconData,
                coordinateAnnotationLayer: CoordinateAnnotationLayer<LabeledAnnotationIconData>
            ) {
                getAnnotationLayerId(coordinateAnnotationLayer)?.let { annotationLayerId ->
                    val payload = Arguments.createMap().apply {
                        putInt("annotationLayerId", annotationLayerId)
                        putInt("annotationId", element.id)
                    }
                    emitEvent(NativeEventType.OnAnnotationDeselectedEvent, payload)
                }
            }
        }

        annotationLayers[annotationLayerId] = CoordinateAnnotationLayerWithAnnotations(coordinateAnnotationLayer)

        mapView.addMapLayer(coordinateAnnotationLayer)
    }

    fun getAnnotationLayerId(coordinateAnnotationLayer: CoordinateAnnotationLayer<LabeledAnnotationIconData>): Int? {
        return annotationLayers.firstNotNullOfOrNull { (annotationLayerId, coordinateAnnotationLayerWithAnnotations) ->
            return if (coordinateAnnotationLayerWithAnnotations.coordinateAnnotationLayer == coordinateAnnotationLayer) {
                annotationLayerId
            } else {
                null
            }
        }
    }

    fun emitEvent(eventType: NativeEventType, payload: WritableMap) {
        val reactContext = context as ReactContext
        val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)

        val event = when (eventType) {
            NativeEventType.OnAnnotationSelectedEvent -> OnAnnotationSelectedEvent(surfaceId, id, payload)
            NativeEventType.OnAnnotationDeselectedEvent -> OnAnnotationDeselectedEvent(surfaceId, id, payload)
        }

        eventDispatcher?.dispatchEvent(event)
    }

    fun removeAnnotationLayer(annotationLayerId: Int) {
        val coordinateAnnotationLayer = annotationLayers[annotationLayerId]
            ?: throw Exception("ReactNativeMapLayrSDK | removeAnnotationLayer | CoordinateAnnotationLayer $annotationLayerId does not exist")

        annotationLayers.remove(annotationLayerId)

        mapView.removeMapLayer(coordinateAnnotationLayer.coordinateAnnotationLayer)
    }

    fun addAnnotation(annotationLayerId: Int, annotationId: Int, annotationJsonString: String) {
        val coordinateAnnotationLayerWithAnnotations = annotationLayers[annotationLayerId] ?:
        throw Exception("ReactNativeMapLayrSDK | addAnnotation | CoordinateAnnotationLayer $annotationLayerId does not exist")

        if (coordinateAnnotationLayerWithAnnotations.annotations.containsKey(annotationId)) {
            throw Exception("ReactNativeMapLayrSDK | addAnnotation | AnnotationId $annotationId already exists")
        }

        val annotationJson = JSONObject(annotationJsonString)

        val title = annotationJson.getNullableString("title")

        val resource = annotationJson.getNullableString("iconAsset")?.let { iconAssetJsonString ->
            val iconAssetJson = JSONObject(iconAssetJsonString)
            val iconUri = iconAssetJson.getString("uri")
            if (BuildConfig.DEBUG) {
                LabeledAnnotationIconData.Resource.Network(
                    uri = iconUri
                )
            } else {
                LabeledAnnotationIconData.Resource.Drawable(
                    resourceId = context.resources.getIdentifier(iconUri, "drawable", context.packageName)
                )
            }
        }

        val coordinates = annotationJson.getJSONArray("coordinates")

        val labeledAnnotationIconData = LabeledAnnotationIconData(
            id = annotationId,
            title = title,
            resource = resource,
            geographicCoordinate = GeographicCoordinate(
                latitude = coordinates.getDouble(0),
                longitude = coordinates.getDouble(1)
            ),
            labelTextColor = annotationJson.getInt("labelTextColor"),
            labelStrokeColor = annotationJson.getInt("labelStrokeColor")
        )

        coordinateAnnotationLayerWithAnnotations.annotations[annotationId] = labeledAnnotationIconData

        coordinateAnnotationLayerWithAnnotations.coordinateAnnotationLayer.insert(labeledAnnotationIconData)

        annotationJson.getNullableBoolean("isSelected")?.let { isSelected ->
            val currentSelection = coordinateAnnotationLayerWithAnnotations.coordinateAnnotationLayer.selectedElements
            if (isSelected) {
                coordinateAnnotationLayerWithAnnotations.coordinateAnnotationLayer.selectedElements = currentSelection + labeledAnnotationIconData
            } else {
                coordinateAnnotationLayerWithAnnotations.coordinateAnnotationLayer.selectedElements = currentSelection - labeledAnnotationIconData
            }
        }
    }

    fun removeAnnotation(annotationLayerId: Int, annotationId: Int) {
        val coordinateAnnotationLayer = annotationLayers[annotationLayerId]
            ?: throw Exception("ReactNativeMapLayrSDK | removeAnnotation | CoordinateAnnotationLayer $annotationLayerId does not exist")

        val annotation = coordinateAnnotationLayer.annotations[annotationId]
            ?: throw Exception("ReactNativeMapLayrSDK | removeAnnotation | Annotation $annotationId does not exist")

        coordinateAnnotationLayer.annotations.remove(annotationId)

        coordinateAnnotationLayer.coordinateAnnotationLayer.remove(annotation)
    }

    fun updateAnnotation(annotationLayerId: Int, annotationId: Int, annotationJson: String) {
        removeAnnotation(annotationLayerId, annotationId)
        addAnnotation(annotationLayerId, annotationId, annotationJson)
    }

    fun addUserLocationMarker(markerId: Int, userLocationJsonString: String) {
        if (locationMarkers.containsKey(markerId)) {
            throw Exception("ReactNativeMapLayrSDK | addUserLocationMarker | MarkerId $markerId already exists")
        }

        val userLocationJson = JSONObject(userLocationJsonString)

        val tintColor = userLocationJson.getNullableInt("tintColor")
        val locationOverride = userLocationJson.getNullableObject("location")
        val headingOverride = userLocationJson.getNullableObject("heading")

        val locationMarker : LocationMarker = when {

            locationOverride != null && headingOverride != null -> {
                val coordinates = locationOverride.getJSONArray("coordinates")
                val horizontalAccuracy = locationOverride.getNullableDouble("horizontalAccuracy")

                val headingDirection = headingOverride.getDouble("direction")
                val headingAccuracy = headingOverride.getDouble("accuracy")

                LocationMarker(
                    locationProvider = Location(
                        geographicCoordinate = GeographicCoordinate(coordinates.getDouble(0), coordinates.getDouble(1)),
                        geographicAccuracy = horizontalAccuracy ?: 0.0,
                        levelId = LevelId.Unknown,
                        bearing = headingDirection,
                        bearingAccuracyDegrees = headingAccuracy
                    ),
                    color = tintColor
                )
            }

            locationOverride != null -> {
                val coordinates = locationOverride.getJSONArray("coordinates")
                val horizontalAccuracy = locationOverride.getNullableDouble("horizontalAccuracy")

                LocationMarker(
                    locationProvider = Location(
                        geographicCoordinate = GeographicCoordinate(coordinates.getDouble(0), coordinates.getDouble(1)),
                        geographicAccuracy = horizontalAccuracy ?: 0.0,
                        levelId = LevelId.Unknown,
                        bearing = 0.0,
                        bearingAccuracyDegrees = 0.0
                    ),
                    color = tintColor
                )
            }

            headingOverride != null -> {
                throw Exception("ReactNativeMapLayrSDK | addUserLocationMarker | Heading override only isn't supported.")
            }

            else -> {
                LocationMarker(
                    locationProvider = GoogleLocationId.HighAccuracy,
                    color = tintColor
                )
            }
        }

        locationMarkers[markerId] = locationMarker

        mapView.addLocationMarker(locationMarker)
    }

    fun updateUserLocationMarker(markerId: Int, userLocationJsonString: String) {
        removeUserLocationMarker(markerId)
        addUserLocationMarker(markerId, userLocationJsonString)
    }

    fun removeUserLocationMarker(markerId: Int) {
        val locationMarker = locationMarkers[markerId]
            ?: throw Exception("ReactNativeMapLayrSDK | removeUserLocationMarker | LocationMarker $markerId does not exist")

        locationMarkers.remove(markerId)

        mapView.removeLocationMarker(locationMarker)
    }

    fun addShape(shapeId: Int, shapeJsonString: String) {
        val shapeJson = JSONObject(shapeJsonString)
        val routeId = shapeJson.getString("routeId")
        val strokeWidth = shapeJson.getDouble("strokeWidth")
        val strokeColor = shapeJson.getNullableInt("strokeColor")
        val order = shapeJson.getInt("order")

        val route = RouteManager.getRoute(id = UUID.fromString(routeId))

        if (route != null) {
            val shape = Shape(
                path = route.path,
                strokeColor = strokeColor,
                strokeWidth = strokeWidth.toFloat()
            )
            shapes[shapeId] = ShapeEntry(shapeId = shapeId, shape = shape, order = order)

            mapView.shapes = shapes.values.sortedBy { it.order }.map { it.shape }
        }
    }

    fun updateShape(shapeId: Int, shapeJson: String) {
        removeShape(shapeId = shapeId)
        addShape(shapeId = shapeId, shapeJsonString = shapeJson)
    }

    fun removeShape(shapeId: Int) {
        shapes.remove(shapeId)
            ?: throw Exception("ReactNativeMapLayrSDK | removeShape | Shape $shapeId does not exist")

        mapView.shapes = shapes.values.sortedBy { it.order }.map { it.shape }
    }

    fun moveCamera(cameraPositionJsonString: String) {
        val cameraPositionJson = JSONObject(cameraPositionJsonString)

        val routeId = cameraPositionJson.getNullableString("route")
        val cameraLocation = if (routeId != null) {
            CameraLocation.Route(
                routeId = UUID.fromString(cameraPositionJson.getString("route"))
            )
        } else {
            try {
                cameraPositionJson.getJSONObject("location").let{ location ->
                    CameraLocation.Single(
                        geographicCoordinate = GeographicCoordinate(
                            location.getDouble("latitude"),
                            location.getDouble("longitude")
                        )
                    )
                }
            } catch (e: JSONException) {
                cameraPositionJson.optJSONArray("location")?.let { locations ->
                    CameraLocation.Many(
                        List(locations.length()) { index ->
                            val location = locations.getJSONObject(index)
                            GeographicCoordinate(
                                location.getDouble("latitude"),
                                location.getDouble("longitude")
                            )
                        }
                    )
                }
            }
        }

        val heading = cameraPositionJson.getNullableDouble("heading")
        val span = cameraPositionJson.getNullableDouble("span")
        val insets = cameraPositionJson.getNullableDouble("insets")
        val tilt = cameraPositionJson.getNullableDouble("tilt")
        val animated = cameraPositionJson.optBoolean("animated")

        when (cameraLocation) {
            is CameraLocation.Single, null -> {
                mapView.moveCamera(
                    coordinates = cameraLocation?.geographicCoordinate,
                    headingDegrees = heading,
                    span = span,
                    insets = insets ?: 0.0,
                    tilt = tilt,
                    animated = animated
                )
            }
            is CameraLocation.Many -> {
                mapView.moveCamera(
                    geographicCoordinateProviders = cameraLocation.geographicCoordinates,
                    headingDegrees = heading,
                    insets = insets ?: 0.0,
                    tilt = tilt,
                    animated = animated
                )
            }
            is CameraLocation.Route -> {
                val route = RouteManager.getRoute(cameraLocation.routeId) ?: return
                mapView.computeSmallestCircle(mapPoints = route.pointsAlongRoute)?.let { (circleCenter, circleSpan) ->
                    mapView.moveCamera(
                        coordinates = circleCenter,
                        headingDegrees = heading,
                        span = circleSpan,
                        tilt = tilt,
                        animated = animated
                    )
                }
            }
        }
    }

    sealed interface CameraLocation {

        data class Single(val geographicCoordinate: GeographicCoordinate) : CameraLocation
        data class Many(val geographicCoordinates: List<GeographicCoordinate>) : CameraLocation
        data class Route(val routeId: UUID) : CameraLocation
    }

    override fun requestLayout() {
        post {
            val widthMeasureSpec = MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY)
            val heightMeasureSpec = MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
            measure(widthMeasureSpec, heightMeasureSpec)
            layout(left, top, right, bottom)
        }

        super.requestLayout()
    }

    class CoordinateAnnotationLayerWithAnnotations(
        val coordinateAnnotationLayer: CoordinateAnnotationLayer<LabeledAnnotationIconData>,
        val annotations: MutableMap<Int, LabeledAnnotationIconData> = mutableMapOf()
    )

    data class ShapeEntry(
        val shapeId: Int,
        val shape: Shape,
        val order: Int
    )

    enum class NativeEventType {

        OnAnnotationSelectedEvent, OnAnnotationDeselectedEvent
    }

    class OnAnnotationSelectedEvent(
        surfaceId: Int,
        viewId: Int,
        private val payload: WritableMap
    ) : Event<OnAnnotationSelectedEvent>(surfaceId, viewId) {

        override fun getEventName() = "onAnnotationSelected"

        override fun getEventData() = payload
    }

    class OnAnnotationDeselectedEvent(
        surfaceId: Int,
        viewId: Int,
        private val payload: WritableMap
    ) : Event<OnAnnotationDeselectedEvent>(surfaceId, viewId) {

        override fun getEventName() = "onAnnotationDeselected"

        override fun getEventData() = payload
    }
}
