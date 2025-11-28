package com.reactnative.maplayr

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.ReactNativeMapViewManagerDelegate
import com.facebook.react.viewmanagers.ReactNativeMapViewManagerInterface

@ReactModule(name = ReactNativeMapViewManager.NAME)
class ReactNativeMapViewManager : SimpleViewManager<ReactNativeMapView>(), ReactNativeMapViewManagerInterface<ReactNativeMapView> {

    private val delegate: ViewManagerDelegate<ReactNativeMapView> = ReactNativeMapViewManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<ReactNativeMapView> = delegate

    override fun getName() = NAME

    public override fun createViewInstance(context: ThemedReactContext): ReactNativeMapView {
        return ReactNativeMapView(context = context)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return mapOf(
            "onAnnotationSelected" to mapOf(
                "registrationName" to "onAnnotationSelected"
            ),
            "onAnnotationDeselected" to mapOf(
                "registrationName" to "onAnnotationDeselected"
            )
        )
    }

    override fun setMap(view: ReactNativeMapView, value: ReadableMap?) {
        val mapId = value?.getString("id") ?: return
        val version = value.getString("version") ?: return

        view.setMapVersionContext(mapVersionContext = ManagedMapManager.getMapVersionContext(mapId, version))
    }

    override fun addAnnotationLayer(view: ReactNativeMapView, annotationLayerId: Int) {
        view.addAnnotationLayer(annotationLayerId = annotationLayerId)
    }

    override fun removeAnnotationLayer(view: ReactNativeMapView, annotationLayerId: Int) {
        view.removeAnnotationLayer(annotationLayerId = annotationLayerId)
    }

    override fun addAnnotation(
        view: ReactNativeMapView,
        annotationLayerId: Int,
        annotationId: Int,
        annotationJson: String
    ) {
        view.addAnnotation(
            annotationLayerId = annotationLayerId,
            annotationId = annotationId,
            annotationJsonString = annotationJson
        )
    }

    override fun updateAnnotation(
        view: ReactNativeMapView,
        annotationLayerId: Int,
        annotationId: Int,
        annotationJson: String
    ) {
        view.updateAnnotation(
            annotationLayerId = annotationLayerId,
            annotationId = annotationId,
            annotationJson = annotationJson
        )
    }

    override fun removeAnnotation(
        view: ReactNativeMapView,
        annotationLayerId: Int,
        annotationId: Int
    ) {
        view.removeAnnotation(annotationLayerId = annotationLayerId, annotationId = annotationId)
    }

    override fun addUserLocationMarker(
        view: ReactNativeMapView,
        markerId: Int,
        userLocationJson: String
    ) {
        view.addUserLocationMarker(markerId = markerId, userLocationJsonString = userLocationJson)
    }

    override fun updateUserLocationMarker(
        view: ReactNativeMapView,
        markerId: Int,
        userLocationJson: String
    ) {
        view.updateUserLocationMarker(
            markerId = markerId,
            userLocationJsonString = userLocationJson
        )
    }

    override fun removeUserLocationMarker(view: ReactNativeMapView, markerId: Int) {
        view.removeUserLocationMarker(markerId = markerId)
    }

    override fun addShape(view: ReactNativeMapView, shapeId: Int, shapeJson: String) {
        view.addShape(shapeId = shapeId, shapeJsonString = shapeJson)
    }

    override fun updateShape(view: ReactNativeMapView, shapeId: Int, shapeJson: String) {
        view.updateShape(shapeId = shapeId, shapeJson = shapeJson)
    }

    override fun removeShape(view: ReactNativeMapView, shapeId: Int) {
        view.removeShape(shapeId = shapeId)
    }

    override fun moveCamera(view: ReactNativeMapView, cameraPositionJson: String) {
        view.moveCamera(cameraPositionJsonString = cameraPositionJson)
    }

    companion object {

        const val NAME = "ReactNativeMapView"
    }
}
