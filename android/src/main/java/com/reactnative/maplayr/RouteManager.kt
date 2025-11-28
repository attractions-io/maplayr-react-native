package com.reactnative.maplayr

import io.attractions.maplayr.model.routes.PathNetwork
import io.attractions.maplayr.model.routes.Route
import io.attractions.positioning.model.coordinate.GeographicCoordinate
import org.json.JSONArray
import java.util.UUID

object RouteManager {

    private val activeRoutes: MutableMap<UUID, Route?> = mutableMapOf()

    fun createRoute(
        mapId: String,
        version: String,
        origin: GeographicCoordinate,
        destinations: Collection<GeographicCoordinate>,
        options: Options
    ) : RouteWithId? {
        val avoidFlags = mutableSetOf<String>()
        for (i in 0 until options.avoidFlags.length()) {
            avoidFlags.add(options.avoidFlags.getString(i))
        }

        val originSpurStrategy = when(options.originSpurStrategy.lowercase()) {
            PathNetwork.RouteOptions.EndpointSpurStrategy.CURVED.name.lowercase() -> PathNetwork.RouteOptions.EndpointSpurStrategy.CURVED
            PathNetwork.RouteOptions.EndpointSpurStrategy.STRAIGHT.name.lowercase() -> PathNetwork.RouteOptions.EndpointSpurStrategy.STRAIGHT
            PathNetwork.RouteOptions.EndpointSpurStrategy.NONE.name.lowercase() -> PathNetwork.RouteOptions.EndpointSpurStrategy.NONE
            else -> PathNetwork.RouteOptions.EndpointSpurStrategy.CURVED
        }
        val destinationSpurStrategy = when(options.destinationSpurStrategy.lowercase()) {
            PathNetwork.RouteOptions.EndpointSpurStrategy.CURVED.name.lowercase() -> PathNetwork.RouteOptions.EndpointSpurStrategy.CURVED
            PathNetwork.RouteOptions.EndpointSpurStrategy.STRAIGHT.name.lowercase() -> PathNetwork.RouteOptions.EndpointSpurStrategy.STRAIGHT
            PathNetwork.RouteOptions.EndpointSpurStrategy.NONE.name.lowercase() -> PathNetwork.RouteOptions.EndpointSpurStrategy.NONE
            else -> PathNetwork.RouteOptions.EndpointSpurStrategy.CURVED
        }

        val route = ManagedMapManager.getMapVersionContext(mapId = mapId, version = version)
            ?.pathNetwork
            ?.calculateDirections(
                from = origin,
                to = destinations,
                options = PathNetwork.RouteOptions(
                    avoidFlags = avoidFlags,
                    attachEndpointsToAllowedPathsOnly = options.attachEndpointsToAllowedPathsOnly,
                    originSpurStrategy = originSpurStrategy,
                    destinationSpurStrategy = destinationSpurStrategy
                )
            )

        return if (route != null) {
            val id = UUID.randomUUID()

            activeRoutes[id] = route

            RouteWithId(id = id, route = route)
        } else {
            null
        }
    }

    fun getRoute(id: UUID) : Route? = activeRoutes[id]

    fun cancelRoute(id: UUID) {
        activeRoutes.remove(key = id)
    }

    data class RouteWithId(
        val id: UUID,
        val route: Route
    )

    data class Options(
        val avoidFlags: JSONArray,
        val attachEndpointsToAllowedPathsOnly: Boolean,
        val originSpurStrategy: String,
        val destinationSpurStrategy: String
    )
}