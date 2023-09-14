/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 10:18:19
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 16:07:00
 * @FilePath     : \vue3_ts\src\components\OpenLayers\index.ts
 * @Description  :
 */
import { h, defineComponent, onMounted } from 'vue'
import Container from './utils/Container'
import { toggleLayerVisibility } from './utils/ControlLayerVisibility'
import { useStyles } from './utils/useStyles'
// 导入图层
import { viewerSettingStore } from '/@/store/modules/viewerSetting'
// 基本配置
import { basicSettingStore } from '/@/store/modules/basicSetting'

export default defineComponent({
  name: 'OpenLayers',

  setup() {
    // DOM
    const map = ref<Container | null>(null)
    // 样式
    const styles = useStyles()
    // 图层管理
    const viewer = viewerSettingStore()
    // 基本配置
    const basicSetting = basicSettingStore()

    onMounted(async () => {
      map.value = new Container('map', basicSetting)
      toggleLayerVisibility(map.value, viewer.ErlMergeViewer)
    })

    return () => h('div', { id: 'map', class: styles.value.map })
  },
})
