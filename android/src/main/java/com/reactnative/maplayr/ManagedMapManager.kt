package com.reactnative.maplayr

import android.os.Handler
import android.os.Looper
import io.attractions.livedata.LifecycleOwner
import io.attractions.livedata.LifecycleOwnerImpl
import io.attractions.livedata.zipWith
import io.attractions.maplayr.context.MapVersionContext
import io.attractions.maplayr.model.map.DownloadResult
import io.attractions.maplayr.model.map.Map

private typealias SubscriptionObserver = (mapId: String, version: String?, error: String?) -> Unit

object ManagedMapManager {

    private val managedMapStates = mutableMapOf<String, ManagedMapState>()

    private val mainHandler = Handler(Looper.getMainLooper())

    fun subscribeToUpdatesForMap(mapId: String, subscriptionObserver: SubscriptionObserver) {
        mainHandler.post {
            if (managedMapStates[mapId] != null) {
                throw Exception("ReactNativeMapLayrSDK | subscribeToUpdatesForMap | mapId: $mapId is already subscribed to")
            }

            val managedMap = Map.managed(mapId = mapId)

            val managedMapUpdateLifecycleOwner = ManagedMapUpdateLifecycleOwner()

            managedMapStates[mapId] = ManagedMapState(managedMapUpdateLifecycleOwner = managedMapUpdateLifecycleOwner)

            managedMap.mapContextLiveData.zipWith(liveData = managedMap.downloadResultLiveData)
                .observe(lifecycleOwner = managedMapUpdateLifecycleOwner) { (mapVersionContext, downloadResult) ->
                    val managedMapState = managedMapStates[mapId]
                        ?: throw Exception("ReactNativeMapLayrSDK | staticMapLiveData observer | mapId: $mapId does not exist")

                    if (mapVersionContext != null) {
                        val added = managedMapState.addMapVersionContext(mapVersionContext = mapVersionContext)
                        if (added) {
                            subscriptionObserver.invoke(mapId, mapVersionContext.version.toString(), null)
                        }
                    } else if (downloadResult != null) {
                        when (downloadResult) {
                            is DownloadResult.Failure -> {
                                subscriptionObserver.invoke(mapId, null, downloadResult.error.message)
                            }

                            DownloadResult.Unauthorized -> {
                                subscriptionObserver.invoke(mapId, null, "Unauthorized: Is your API key correct?")
                            }

                            DownloadResult.NoUpdateAvailable, is DownloadResult.Success -> {
                                throw Exception("ReactNativeMapLayrSDK | staticMapLiveData observer | Download result is $downloadResult for mapId: $mapId but staticMap.version is null")
                            }
                        }
                    }
                }
        }
    }

    fun unSubscribeToUpdatesForMap(mapId: String) {
        mainHandler.post {
            managedMapStates.remove(key = mapId)
                ?: throw Exception("ReactNativeMapLayrSDK | unSubscribeToUpdatesForMap | mapId: $mapId does not exist")
        }
    }

    fun getMapVersionContext(mapId: String, version: String): MapVersionContext? {
        return managedMapStates[mapId]?.getMapVersionContext(version = version)
    }

    class ManagedMapUpdateLifecycleOwner : LifecycleOwner by LifecycleOwnerImpl()

    class ManagedMapState(
        @Suppress("unused") // This is holding a strong reference to staticMapUpdateLifecycleOwner
        private val managedMapUpdateLifecycleOwner: ManagedMapUpdateLifecycleOwner,
        private val mapVersionContexts : MutableMap<String, MapVersionContext> = mutableMapOf()
    ) {

        fun addMapVersionContext(mapVersionContext: MapVersionContext): Boolean {
            return mapVersionContexts.putIfAbsent(mapVersionContext.version.toString(), mapVersionContext) == null
        }

        fun getMapVersionContext(version: String) : MapVersionContext? = mapVersionContexts[version]
    }
}
