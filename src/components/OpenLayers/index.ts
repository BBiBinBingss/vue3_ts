/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 10:18:19
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-10-19 10:28:14
 * @FilePath     : \vue3_ts\src\components\OpenLayers\index.ts
 * @Description  :
 */
import { defineComponent, h, onMounted, shallowRef } from 'vue'
import Container from './utils/Container'
import { toggleLayerVisibility } from './utils/ControlLayerVisibility'
import { defaultVisibleLayerNames } from './utils/Layer'
import type { MapViewSettings } from './utils/View'

const defaultViewSettings: MapViewSettings = {
  Projection: 'EPSG:4326',
  Coordinate: [114.4, 32.8],
  zoomTo: 7,
}

const mapStyle = {
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  position: 'relative',
} as const

export default defineComponent({
  name: 'OpenLayers',

  setup() {
    const map = shallowRef<Container | null>(null)

    onMounted(async () => {
      try {
        map.value = new Container('openlayers-map', defaultViewSettings)
        toggleLayerVisibility(map.value, defaultVisibleLayerNames)
      } catch (error) {
        console.error('初始化OpenLayers时出错:', error)
      }
    })

    return () => h('div', { id: 'openlayers-map', style: mapStyle })
  },
})
