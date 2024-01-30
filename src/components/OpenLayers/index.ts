/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 10:18:19
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-10-19 10:28:14
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
    // DOM和样式的引用
    const map = ref<Container | null>(null)
    const styles = useStyles()

    // 直接从store中提取所需的状态
    const { ErlMergeViewer } = viewerSettingStore()
    const basicSetting = basicSettingStore()

    onMounted(async () => {
      try {
        // 初始化地图容器
        map.value = new Container('map', basicSetting)
        // 切换图层可见性
        toggleLayerVisibility(map.value, ErlMergeViewer)
      } catch (error) {
        // 错误处理
        console.error('初始化OpenLayers时出错:', error)
      }
    })

    return () => h('div', { id: 'map', class: styles.value.map })
  },
})
