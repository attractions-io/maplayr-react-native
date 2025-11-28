package com.reactnative.maplayr

import io.attractions.livedata.LifecycleOwner
import io.attractions.livedata.LifecycleOwnerImpl
import io.attractions.positioning.google.GoogleLocationId
import io.attractions.positioning.model.coordinate.LocationId
import io.attractions.positioning.model.coordinate.LocationResponse
import io.attractions.positioning.model.opengl.location.GlobalLocationManager
import java.util.UUID

private typealias LocationObserver = (locationId: String, locationResponse: LocationResponse) -> Unit

object LocationManager {

    private class LocationLifecycleOwner() : LifecycleOwner by LifecycleOwnerImpl()

    private val locationIdObservations = mutableMapOf<UUID, LocationLifecycleOwner>()

    fun startLocationUpdates(locationObserver: LocationObserver): ReactLocationIdWithLocationResponse {
        val locationId = GoogleLocationId.HighAccuracy
        val locationIdWithLifeCycle = LocationLifecycleOwner()

        val id = UUID.randomUUID()

        var initialLocationResponse : LocationResponse? = null

        GlobalLocationManager.getLocationLiveData(locationId).observe(locationIdWithLifeCycle) { locationResponse ->
            if (initialLocationResponse == null) {
                initialLocationResponse = locationResponse
            }
            locationObserver.invoke(id.toString(), locationResponse)
        }

        locationIdObservations[id] = locationIdWithLifeCycle

        return ReactLocationIdWithLocationResponse(
            reactLocationId = id,
            locationResponse = initialLocationResponse
        )
    }

    fun stopLocationUpdates(locationId: UUID) {
        locationIdObservations.remove(locationId)
            ?: throw Exception("ReactNativeMapLayrSDK | stopLocationUpdates | LocationId $locationId does not exist")
    }

    data class ReactLocationIdWithLocationResponse(
        val reactLocationId: UUID,
        val locationResponse: LocationResponse?
    )
}