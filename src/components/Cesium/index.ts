/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 16:37:19
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-18 17:05:49
 * @FilePath     : \vue3_ts\src\components\Cesium\index.ts
 * @Description  :
 */

import { h, defineComponent, onMounted } from 'vue'
import Container from './utils/Container'
import useStyles from './utils/useStyles'

// pinia
import { layersSettingStore } from '/@/store/modules/layersSetting'

export default defineComponent({
  name: 'Cesium',
  setup() {
    // 初始化地图
    const cesiumContainer = ref<any>(null)
    // 样式
    const styles = useStyles()
    // 图层
    const layers = layersSettingStore()

    onMounted(() => {
      const container = new Container('cesium-container')
      cesiumContainer.value = container.container
      // 初始化默认图层
      layers.setLayers(container.container, ['img', 'cia'])
    })

    return () => {
      return h('div', {
        id: 'cesium-container',
        class: styles.value.cesiumContainer,
      })
    }
  },
})
