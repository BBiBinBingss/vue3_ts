import { defineComponent, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import type { Viewer } from 'cesium'
import { cesiumConfigKey } from '../context'
import { onViewerReady } from '../utils/viewerRegistry'
import { setVisibleBaseLayers } from '../utils/useLayer'

export default defineComponent({
  name: 'CesiumBaseLayerProvider',
  setup() {
    const config = inject(cesiumConfigKey)
    let viewer: Viewer | null = null
    let stopViewerReadyListener: (() => void) | null = null

    const applyBaseLayers = () => {
      if (!viewer) {
        return
      }

      const nextLayers = config?.defaultBaseLayerIds.value ?? ['vec', 'cva']
      setVisibleBaseLayers(viewer, nextLayers)
    }

    onMounted(() => {
      stopViewerReadyListener = onViewerReady((nextViewer) => {
        viewer = nextViewer
        applyBaseLayers()
      })
    })

    watch(
      () => config?.defaultBaseLayerIds.value,
      () => {
        applyBaseLayers()
      },
      { deep: true }
    )

    onBeforeUnmount(() => {
      stopViewerReadyListener?.()
      stopViewerReadyListener = null
      viewer = null
    })

    return () => null
  },
})
