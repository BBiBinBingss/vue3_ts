/**
 * OpenLayers Vue 组件入口。
 *
 * 职责：
 * 1. 初始化地图与 mock 数据。
 * 2. 接收外部 `visibleTypes`，控制点线面图层显隐。
 * 3. 对外暴露飞行定位、重建 mock、切换底图等集成能力。
 * 4. 通过事件将 mock 列表与底图状态回传给页面面板。
 */
import { defineComponent, h, onMounted, onUnmounted, shallowRef, watch, type PropType } from 'vue'
import {
  createMap,
  destroyMap,
  flyToMockFeatureById,
  getAvailableBaseMapPresets,
  getDefaultVisibleBaseLayerNames,
  loadMockFeatures,
  loadMockFeaturesInViewport,
  setGeometryLayerVisibility,
  switchBaseMapPreset,
  toMockDisplayItems,
} from './modules'
import type { MapContext, MockDisplayItem, MockFeatureItem, MockGeometryType } from './modules/map'
import type { BaseMapPresetKey, BaseMapPresetOption } from './modules/layer'

const mapStyle = {
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  position: 'relative',
} as const

export default defineComponent({
  name: 'OpenLayers',

  props: {
    /** 当前需要显示的几何类型列表。 */
    visibleTypes: {
      type: Array as PropType<MockGeometryType[]>,
      default: () => ['point', 'line', 'polygon'],
    },
  },

  /**
   * - `mock-ready`: 返回可渲染的 mock 列表
   * - `basemap-ready`: 返回可用底图预设及当前选中项
   * - `basemap-changed`: 底图切换完成通知
   */
  emits: ['mock-ready', 'basemap-ready', 'basemap-changed'],

  setup(props, { expose, emit }) {
    const mapContext = shallowRef<MapContext | null>(null)
    const mockItems = shallowRef<MockFeatureItem[]>([])
    const baseMapPresets = shallowRef<BaseMapPresetOption[]>([])
    const currentBaseMap = shallowRef<BaseMapPresetKey>('osm')

    /** 同步点/线/面图层显隐。 */
    const syncMockVisibility = () => {
      if (!mapContext.value) {
        return
      }

      setGeometryLayerVisibility(mapContext.value, props.visibleTypes)
    }

    /** 根据 mock id 飞行定位。 */
    const flyToMockById = (featureId: string) => {
      if (!mapContext.value) {
        return
      }

      flyToMockFeatureById(mapContext.value, mockItems.value, featureId)
    }

    /** 获取供页面渲染的 mock 列表（不含 feature 引用）。 */
    const getMockItems = (): MockDisplayItem[] => {
      return toMockDisplayItems(mockItems.value)
    }

    /** 向外发布 mock 列表。 */
    const publishMockItems = () => {
      emit('mock-ready', toMockDisplayItems(mockItems.value))
    }

    /** 向外发布底图预设信息。 */
    const publishBaseMapReady = () => {
      emit('basemap-ready', {
        presets: baseMapPresets.value,
        current: currentBaseMap.value,
      })
    }

    /** 随机数量重建 mock。 */
    const reloadMockRandom = () => {
      if (!mapContext.value) {
        return
      }

      mockItems.value = loadMockFeatures(mapContext.value, {
        pointCount: 50 + Math.floor(Math.random() * 31),
        lineCount: 18 + Math.floor(Math.random() * 15),
        polygonCount: 8 + Math.floor(Math.random() * 11),
      })

      syncMockVisibility()
      publishMockItems()
    }

    /** 在当前地图视野内重建 mock。 */
    const reloadMockByViewport = () => {
      if (!mapContext.value) {
        return
      }

      mockItems.value = loadMockFeaturesInViewport(mapContext.value, {
        pointCount: 80,
        lineCount: 30,
        polygonCount: 16,
      })

      syncMockVisibility()
      publishMockItems()
    }

    /** 切换底图预设。 */
    const switchBaseMap = (presetKey: BaseMapPresetKey) => {
      if (!mapContext.value) {
        return
      }

      const switched = switchBaseMapPreset(mapContext.value.map, presetKey)

      if (!switched) {
        return
      }

      currentBaseMap.value = switched
      emit('basemap-changed', switched)
    }

    /** 获取可用底图预设列表。 */
    const getBaseMapPresets = () => {
      return baseMapPresets.value
    }

    /** 组件挂载：初始化地图、底图、mock。 */
    onMounted(() => {
      try {
        mapContext.value = createMap({
          target: 'openlayers-map',
          view: {
            projection: 'EPSG:4326',
            center: [114.4, 32.8],
            zoom: 7,
          },
          visibleBaseLayers: getDefaultVisibleBaseLayerNames(),
        })

        baseMapPresets.value = getAvailableBaseMapPresets()
        currentBaseMap.value = baseMapPresets.value[0]?.key ?? 'osm'
        publishBaseMapReady()

        mockItems.value = loadMockFeatures(mapContext.value, {
          pointCount: 60,
          lineCount: 24,
          polygonCount: 12,
        })

        syncMockVisibility()
        publishMockItems()
      } catch (error) {
        console.error('初始化OpenLayers时出错:', error)
      }
    })

    /** 组件卸载：销毁地图并释放 mock 缓存。 */
    onUnmounted(() => {
      destroyMap(mapContext.value)
      mockItems.value = []
      mapContext.value = null
    })

    /** 监听外部显隐类型变化并同步图层。 */
    watch(
      () => props.visibleTypes,
      () => {
        syncMockVisibility()
      },
      { deep: true },
    )

    /**
     * 暴露给父组件的方法：
     * - flyToMockById
     * - getMockItems
     * - reloadMockRandom
     * - reloadMockByViewport
     * - switchBaseMap
     * - getBaseMapPresets
     */
    expose({
      flyToMockById,
      getMockItems,
      reloadMockRandom,
      reloadMockByViewport,
      switchBaseMap,
      getBaseMapPresets,
    })

    return () => h('div', { id: 'openlayers-map', style: mapStyle })
  },
})
