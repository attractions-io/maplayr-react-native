package com.reactnative.maplayr

import android.content.res.ColorStateList
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.view.ViewGroup
import android.widget.ImageView
import io.attractions.maplayr.androidLayer.annotation.CoordinateAnnotationLayer
import io.attractions.maplayr.androidLayer.annotation.CoordinateAnnotationViewHolder
import io.attractions.maplayr.androidLayer.annotation.defaultAnnotation.LabeledAnnotationIcon
import java.lang.ref.WeakReference
import java.net.HttpURLConnection
import java.net.URL

class LabeledAnnotationIconAnnotationLayerAdapter : CoordinateAnnotationLayer.Adapter<LabeledAnnotationIconData> {

    class LabeledAnnotationIconViewHolder(view: LabeledAnnotationIcon) : CoordinateAnnotationViewHolder(view)

    override fun createView(parent: ViewGroup, viewType: Int) = LabeledAnnotationIconViewHolder(LabeledAnnotationIcon(parent.context))

    override fun bindView(
        coordinateAnnotationViewHolder: CoordinateAnnotationViewHolder,
        element: LabeledAnnotationIconData
    ) {
        val labeledAnnotationIcon = coordinateAnnotationViewHolder.view as LabeledAnnotationIcon
        when (element.resource) {

            is LabeledAnnotationIconData.Resource.Drawable -> {
                (labeledAnnotationIcon.annotationIcon as ImageView).setImageResource(element.resource.resourceId)
            }

            is LabeledAnnotationIconData.Resource.Network -> {
                ImageDownloaderThread(
                    element.resource.uri,
                    WeakReference(labeledAnnotationIcon.annotationIcon as ImageView)
                ).start()
            }

            null -> {
                (labeledAnnotationIcon.annotationIcon as ImageView).setImageDrawable(null)
            }
        }

        labeledAnnotationIcon.labelText = element.title
        labeledAnnotationIcon.labelTextColor = ColorStateList.valueOf(element.labelTextColor)
        labeledAnnotationIcon.labelOutlineColor = ColorStateList.valueOf(element.labelStrokeColor)
    }

    override fun annotationLocation(element: LabeledAnnotationIconData) = element.geographicCoordinate

    class ImageDownloaderThread(
        private val uri: String,
        private val weakImageView: WeakReference<ImageView>
    ): Thread() {

        override fun run() {
            val connection = URL(uri).openConnection() as HttpURLConnection

            connection.inputStream.use { inputStream ->
                val bitmap = BitmapFactory.decodeStream(inputStream)
                Handler(Looper.getMainLooper()).post {
                    weakImageView.get()?.setImageBitmap(bitmap)
                }
            }
        }
    }
}
