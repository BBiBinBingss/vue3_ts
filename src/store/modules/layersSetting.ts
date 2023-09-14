import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { store } from '/@/store'

interface LayersSettingState {
  layers: any[]
}

export const layersSettingStore = defineStore({
  id: 'app-layers-setting',
  state: (): LayersSettingState => ({
    layers: [],
  }),
  getters: {},
  actions: {
    setLayers(viewer: any, layers: any[]) {
      this.layers = layers
      nextTick(() => {
        const imageryLayers = viewer.imageryLayers._layers
        for (let i = 0; i < this.layers.length; i++) {
          const layer = imageryLayers.find((imageryLayer: { imageryProvider: { _layer: any } }) => {
            return imageryLayer.imageryProvider._layer === layers[i]
          })
          if (layer) layer.show = true
        }
      })
    },
  },
})

// Need to be used outside the setup
export const useCarouselSettingWithOut = () => {
  return layersSettingStore(store)
}
