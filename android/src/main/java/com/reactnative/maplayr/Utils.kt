package com.reactnative.maplayr

import org.json.JSONObject

object Utils {

    fun JSONObject.getNullableString(key: String) : String? {
        return if (has(key) && !isNull(key)) {
            getString(key)
        } else {
            null
        }
    }

    fun JSONObject.getNullableObject(key: String) : JSONObject? {
        return if (has(key) && !isNull(key)) {
            getJSONObject(key)
        } else {
            null
        }
    }

    fun JSONObject.getNullableInt(key: String) : Int? {
        return if (has(key) && !isNull(key)) {
            getInt(key)
        } else {
            null
        }
    }

    fun JSONObject.getNullableDouble(key: String) : Double? {
        return if (has(key) && !isNull(key)) {
            getDouble(key)
        } else {
            null
        }
    }

    fun JSONObject.getNullableBoolean(key: String) : Boolean? {
        return if (has(key) && !isNull(key)) {
            getBoolean(key)
        } else {
            null
        }
    }
}
