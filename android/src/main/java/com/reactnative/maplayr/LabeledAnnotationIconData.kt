package com.reactnative.maplayr

import io.attractions.positioning.model.coordinate.GeographicCoordinate

data class LabeledAnnotationIconData(
    val id: Int,
    val title: String?,
    val resource: Resource?,
    val geographicCoordinate: GeographicCoordinate,
    val labelTextColor: Int,
    val labelStrokeColor: Int
) {

    override fun equals(other: Any?): Boolean {
        return other is LabeledAnnotationIconData && id == other.id
    }

    sealed interface Resource {

        data class Drawable(val resourceId: Int) : Resource
        data class Network(val uri: String) : Resource
    }
}
