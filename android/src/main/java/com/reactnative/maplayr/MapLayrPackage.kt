package com.reactnative.maplayr

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class MapLayrPackage : BaseReactPackage() {

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return listOf(
            ReactNativeMapViewManager()
        )
    }

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return when (name) {
            ReactNativeMapViewManager.NAME -> ReactNativeMapViewManager()
            NativeMapModule.NAME -> NativeMapModule(reactContext)
            else -> null
        }
    }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            ReactNativeMapViewManager.NAME to ReactModuleInfo(
                name = ReactNativeMapViewManager.NAME,
                className = ReactNativeMapViewManager.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            ),
            NativeMapModule.NAME to ReactModuleInfo(
                name = NativeMapModule.NAME,
                className = NativeMapModule.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
        )
    }
}
