import { defineComponent, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import type { Viewer } from 'cesium'
import { cesiumConfigKey } from '../context'
import { onViewerReady } from '../utils/viewerRegistry'
import { loadTerrain, removeTerrain } from '../utils/CesiumTerrainLoader'

export default defineComponent({
  name: 'CesiumTerrainProvider',
  setup() {
    const config = inject(cesiumConfigKey)
    let viewer: Viewer | null = null
    let stopViewerReadyListener: (() => void) | null = null

    const applyTerrain = () => {
      if (!viewer) {
        return
      }

      const enabled = config?.terrainEnabled.value ?? true
      const terrainUrl = config?.terrainUrl.value ?? ''

      if (enabled && terrainUrl) {
        loadTerrain(viewer, terrainUrl)
      } else {
        removeTerrain(viewer)
      }
      viewer.scene?.requestRender()
    }

    onMounted(() => {
      stopViewerReadyListener = onViewerReady((nextViewer) => {
        viewer = nextViewer
        applyTerrain()
      })
    })

    watch(
      [() => config?.terrainEnabled.value, () => config?.terrainUrl.value],
      () => {
        applyTerrain()
      }
    )

    onBeforeUnmount(() => {
      stopViewerReadyListener?.()
      stopViewerReadyListener = null
      viewer = null
    })

    return () => null
  },
})
