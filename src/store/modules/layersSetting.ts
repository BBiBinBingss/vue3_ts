import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { store } from '/@/store'
import type { Viewer } from 'cesium'
import { setVisibleBaseLayers } from '/@/components/Cesium/utils/useLayer'

interface LayersSettingState {
  layers: string[]
}

export const layersSettingStore = defineStore({
  id: 'app-layers-setting',
  state: (): LayersSettingState => ({
    layers: [],
  }),
  getters: {},
  actions: {
    setLayers(viewer: any, layers: any[]) {
      this.layers = [...layers]
      nextTick(() => {
        if (!viewer) {
          return
        }
        setVisibleBaseLayers(viewer as Viewer, this.layers)
      })
    },
  },
})

// Need to be used outside the setup
export const useCarouselSettingWithOut = () => {
  return layersSettingStore(store)
}
