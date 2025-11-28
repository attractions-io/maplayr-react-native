package com.reactnative.maplayr

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import io.attractions.positioning.model.coordinate.GeographicCoordinate
import io.attractions.positioning.model.coordinate.Location
import io.attractions.positioning.model.coordinate.LocationResponse
import org.json.JSONObject
import java.util.UUID

class NativeMapModule(reactContext: ReactApplicationContext) : NativeMapSpec(reactContext) {

    private val subscriptionObserver : (String, String?, String?) -> Unit = { mapId, version, error ->
        emitOnMapUpdate(Arguments.createMap().apply {
            putString("status", if(version != null) "success" else "error")
            putString("mapId", mapId)
            putString("version", version)
            putString("error", error)
        })
    }

    private val locationObserver : (String, LocationResponse) -> Unit = { locationId, locationResponse ->
        when (locationResponse) {
            is Location -> {
                val locationJSON = JSONObject().apply {
                    put("latitude", locationResponse.geographicCoordinate.latitude)
                    put("longitude", locationResponse.geographicCoordinate.longitude)
                    put("horizontalAccuracy", locationResponse.geographicAccuracy)
                }
                emitOnLocationUpdate(Arguments.createMap().apply {
                    putString("locationId", locationId)
                    putString("location", locationJSON.toString())
                })
            }
            else -> {}
        }
    }

    override fun getName() = NAME

    override fun subscribeToUpdatesForMap(mapId: String) {
        ManagedMapManager.subscribeToUpdatesForMap(
            mapId = mapId,
            subscriptionObserver = subscriptionObserver
        )
    }

    override fun unSubscribeToUpdatesForMap(mapId: String) {
        ManagedMapManager.unSubscribeToUpdatesForMap(mapId = mapId)
    }

    override fun createRoute(params: String): String {
        val inputJson = JSONObject(params)

        val origin = inputJson.getJSONArray("origin")
        val destination = inputJson.getJSONArray("destination")

        val mapId = inputJson.getString("mapId")
        val versionId = inputJson.getString("versionId")

        val destinations = List(destination.length()) { i ->
            destination.getJSONArray(i).let { current ->
                GeographicCoordinate(
                    latitude = current.getDouble(0),
                    longitude = current.getDouble(1)
                )
            }
        }

        val routeOptions = inputJson.getJSONObject("options")
        val avoidFlags = routeOptions.getJSONArray("avoidFlags")
        val attachEndpointsToAllowedPathsOnly = routeOptions.getBoolean("attachEndpointsToAllowedPathsOnly")
        val originSpurStrategy = routeOptions.getString("originSpurStrategy")
        val destinationSpurStrategy = routeOptions.getString("destinationSpurStrategy")

        val routeWithId = RouteManager.createRoute(
            mapId = mapId,
            version = versionId,
            origin = GeographicCoordinate(
                latitude = origin.getDouble(0),
                longitude = origin.getDouble(1)
            ),
            destinations = destinations,
            options = RouteManager.Options(
                avoidFlags = avoidFlags,
                attachEndpointsToAllowedPathsOnly = attachEndpointsToAllowedPathsOnly,
                originSpurStrategy = originSpurStrategy,
                destinationSpurStrategy = destinationSpurStrategy
            )
        )

        return if (routeWithId != null) {
            JSONObject().apply {
                put("success", true)
                put("route", JSONObject().apply {
                    put("distance", routeWithId.route.distance)
                })
                put("routeId", routeWithId.id)
            }.toString()
        } else {
            JSONObject().apply {
                put("success", false)
                put("error", "Unable to calculate route")
            }.toString()
        }
    }

    override fun cancelRoute(routeId: String) {
        RouteManager.cancelRoute(id = UUID.fromString(routeId))
    }

    override fun startLocationUpdates(): String {
        val (id, locationResponse) = LocationManager.startLocationUpdates(locationObserver)

        val locationPayload = locationResponse?.let { response ->
            when(response) {
                is Location -> {
                    JSONObject().apply {
                        put("latitude", response.geographicCoordinate.latitude)
                        put("longitude", response.geographicCoordinate.longitude)
                        put("horizontalAccuracy", response.geographicAccuracy)
                    }
                }
                else -> null
            }
        }

        return JSONObject().apply {
            put("id", id)
            put("location", locationPayload)
        }.toString()
    }

    override fun stopLocationUpdates(locationId: String) {
        LocationManager.stopLocationUpdates(locationId = UUID.fromString(locationId))
    }

    companion object {

        const val NAME = "NativeMap"
    }
}