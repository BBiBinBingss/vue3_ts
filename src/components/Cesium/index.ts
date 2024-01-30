/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 16:37:19
 * @LastEditors: tangbo 852425209@qq.com
 * @LastEditTime: 2024-01-08 10:20:06
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
    // 地图容器的引用
    const cesiumContainer = ref<any | null>(null)
    // 获取样式钩子
    const styles = useStyles()
    // 获取图层设置的store
    const layers = layersSettingStore()

    onMounted(() => {
      cesiumContainer.value = new Container('cesium-container')
      // 使用layers store初始化默认图层
      layers.setLayers(cesiumContainer.value.container, ['vec', 'cva'])
    })

    return () => {
      // 渲染地图容器
      return h('div', {
        id: 'cesium-container',
        class: styles.value.cesiumContainer,
      })
    }
  },
})
