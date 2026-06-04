<!--
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-06-29 16:54:07
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-24 11:06:20
 * @FilePath     : \vue3_ts\src\pages\index\index.vue
 * @Description  : 首页
-->

<template>
  <div class="gis-demo-page">
    <Cesium :default-base-layer-ids="currentBaseLayerIds" :terrain-url="terrainUrl" />
    <div class="gis-toolbar" aria-label="GIS 演示操作面板">
      <div class="gis-toolbar__header">
        <div>
          <strong>GIS 交互 Demo</strong>
          <span>{{ viewerReady ? (loading ? '处理中' : '可操作') : '初始化中' }}</span>
        </div>
        <button
          class="gis-toolbar__health"
          type="button"
          :disabled="!viewerReady || loading"
          @click="handleHealthCheck"
        >
          健康检查
        </button>
      </div>

      <div class="gis-toolbar__section">
        <div class="gis-toolbar__title">数据生成</div>
        <div class="gis-action-grid">
          <button
            v-for="action in demoActions"
            :key="action.key"
            class="gis-demo-button"
            type="button"
            :class="`gis-demo-button--${action.tone}`"
            :disabled="isActionDisabled(action)"
            @click="action.handler"
          >
            <span>{{ action.label }}</span>
            <em>{{ action.remark }}</em>
          </button>
        </div>
      </div>

      <div class="gis-toolbar__section">
        <div class="gis-toolbar__title">底图切换</div>
        <div class="gis-segmented">
          <button
            v-for="option in baseLayerOptions"
            :key="option.key"
            type="button"
            :class="{ 'is-active': activeBaseLayer === option.key }"
            :disabled="!viewerReady || loading"
            @click="handleSwitchBaseLayer(option.key)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="gis-toolbar__section">
        <div class="gis-toolbar__title">图层显示</div>
        <div class="gis-layer-grid">
          <button
            v-for="layer in demoLayerOptions"
            :key="layer.key"
            type="button"
            :class="{
              'is-active': layerVisibility[layer.key],
              'is-empty': getDemoLayerCount(layer.key) === 0,
            }"
            :disabled="!viewerReady || loading || getDemoLayerCount(layer.key) === 0"
            @click="handleToggleDemoLayer(layer.key)"
          >
            <span>{{ layer.label }}</span>
            <em>{{ getDemoLayerCount(layer.key) }}</em>
          </button>
        </div>
      </div>
    </div>

    <div class="gis-info-panel" aria-label="GIS 状态评估面板">
      <div class="gis-info-panel__header">
        <div>
          <strong>评估摘要</strong>
          <span>当前底图：{{ activeBaseLayerLabel }}</span>
        </div>
        <em :class="{ 'is-ready': viewerReady }">{{ viewerReady ? 'Ready' : 'Loading' }}</em>
      </div>

      <div class="gis-metric-grid" aria-label="数据规模">
        <div>
          <span>点</span>
          <strong>{{ status.pointCount }}</strong>
        </div>
        <div>
          <span>线</span>
          <strong>{{ status.lineCount }}</strong>
        </div>
        <div>
          <span>面</span>
          <strong>{{ status.polygonCount }}</strong>
        </div>
        <div>
          <span>轨迹</span>
          <strong>{{ status.trackPointCount }}</strong>
        </div>
      </div>

      <div class="gis-info-list">
        <p>
          <strong>地图状态</strong>
          <span>{{ viewerReady ? '已就绪' : '初始化中' }}</span>
        </p>
        <p>
          <strong>最近动作</strong>
          <span>{{ status.lastAction || '暂无' }}</span>
        </p>
        <p>
          <strong>运行体检</strong>
          <span>{{ status.healthSummary || '未检测' }}</span>
        </p>
        <p>
          <strong>体检详情</strong>
          <span>{{ status.healthDetails || '点击健康检查获取诊断信息' }}</span>
        </p>
        <p>
          <strong>业务图层</strong>
          <span>{{ layerVisibleSummary }}</span>
        </p>
        <p>
          <strong>随机范围</strong>
          <span>{{ status.activeBbox }}</span>
        </p>
        <p>
          <strong>交互信息</strong>
          <span>{{ status.interactionMessage || '点击地图要素查看详情' }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Cartesian2, Cartographic, Math as CesiumMath } from 'cesium'
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import Cesium from '/@/components/Cesium'
import { getViewerInstance } from '/@/components/Cesium/utils/viewerRegistry'
import { layersSettingStore } from '/@/store/modules/layersSetting'
import {
  DEFAULT_BASE_LAYER_OPTION_KEY,
  getEnabledBaseLayerOptions,
  type BaseLayerOption,
} from '/@/settings/baseLayerSetting'
import {
  addLineLayer,
  addPointLayer,
  addPolygonLayer,
  createMovingTrack,
  createRandomLines,
  createRandomPoints,
  createRandomPolygons,
  getLayerEntityCount,
  hasLayer,
  mockCarTracks,
  mockDevicePoints,
  mockWarningPolygons,
  onCesiumViewerReady,
  removeLayer,
  setLayerVisible,
  type GeoFeatureProperties,
  type LayerInteractionEvent,
} from '/@/utils/gis'

const viewerReady = ref(false)
const loading = ref(false)

const status = reactive({
  lastAction: '',
  interactionMessage: '',
  healthSummary: '',
  healthDetails: '',
  activeBbox: '--',
  pointCount: 0,
  lineCount: 0,
  polygonCount: 0,
  trackPointCount: 0,
})

const SOURCE_IDS = {
  points: 'demo-random-points',
  lines: 'demo-random-lines',
  polygons: 'demo-random-polygons',
  track: 'demo-moving-track',
} as const

type DemoLayerKey = keyof typeof SOURCE_IDS
type BBox = [number, number, number, number]
type BaseLayerKey = string
type DemoButtonTone = 'point' | 'line' | 'polygon' | 'track' | 'mock' | 'danger' | 'reset'

interface DemoLayerOption {
  key: DemoLayerKey
  label: string
}

interface ToolbarAction {
  key: string
  label: string
  remark: string
  tone: DemoButtonTone
  handler: () => void | Promise<void>
}

const FALLBACK_BBOX: BBox = [113.7, 22.3, 114.2, 22.8]
const LOAD_THROTTLE_MS = 80
const SECONDARY_INSPECT_DELAY_MS = 1200
let secondaryInspectTimer: ReturnType<typeof setTimeout> | null = null
const terrainUrl = import.meta.env.VITE_APP_MAP_URL ?? ''

/**
 * 底图按钮配置。
 * 说明：
 * - layerIds 对应天地图 WMTS 的 layer 参数，和 useLayer.ts 中创建 Provider 时保持一致。
 * - “影像无注记”用于排查业务图层遮挡，演示时可以只看影像底纹。
 * - “隐藏”保留业务数据图层，便于确认点线面是否真正由 GeoJSON 数据源渲染。
 */
const baseLayerOptions: BaseLayerOption[] = getEnabledBaseLayerOptions()
const fallbackBaseLayerKey = baseLayerOptions[0]?.key ?? 'none'

/**
 * 业务图层开关配置。
 * 这里只控制当前 demo 生成的数据图层显隐，不删除数据源；再次点击可以恢复显示。
 */
const demoLayerOptions: DemoLayerOption[] = [
  { key: 'points', label: '点' },
  { key: 'lines', label: '线' },
  { key: 'polygons', label: '面' },
  { key: 'track', label: '轨迹' },
]

const activeBaseLayer = ref<BaseLayerKey>(
  baseLayerOptions.some((item) => item.key === DEFAULT_BASE_LAYER_OPTION_KEY)
    ? DEFAULT_BASE_LAYER_OPTION_KEY
    : fallbackBaseLayerKey
)
const layerVisibility = reactive<Record<DemoLayerKey, boolean>>({
  points: false,
  lines: false,
  polygons: false,
  track: false,
})

const setInteractionMessage = (message: string): void => {
  status.interactionMessage = message
}

const getDemoLayerCount = (key: DemoLayerKey): number => {
  const countMap: Record<DemoLayerKey, number> = {
    points: status.pointCount,
    lines: status.lineCount,
    polygons: status.polygonCount,
    track: status.trackPointCount,
  }
  return countMap[key]
}

const getDemoLayerLabel = (key: DemoLayerKey): string => {
  return demoLayerOptions.find((item) => item.key === key)?.label ?? '图层'
}

const activeBaseLayerLabel = computed(() => {
  return baseLayerOptions.find((item) => item.key === activeBaseLayer.value)?.label ?? '未知'
})

const currentBaseLayerIds = computed(() => {
  return baseLayerOptions.find((item) => item.key === activeBaseLayer.value)?.layerIds ?? []
})

const layerVisibleSummary = computed(() => {
  return demoLayerOptions
    .map((item) => {
      const count = getDemoLayerCount(item.key)
      const visible = count > 0 && layerVisibility[item.key]
      return `${item.label}${visible ? '显示' : '隐藏'}(${count})`
    })
    .join(' / ')
})

const setAllDemoLayerVisibility = (visible: boolean): void => {
  demoLayerOptions.forEach((item) => {
    layerVisibility[item.key] = visible
  })
}

const requestSceneRender = (): void => {
  const viewer = getViewerInstance()
  viewer?.scene?.requestRender()
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

const runThrottledTasks = async (tasks: Array<() => Promise<void>>): Promise<void> => {
  for (let index = 0; index < tasks.length; index += 1) {
    await tasks[index]()
    if (index < tasks.length - 1) {
      await sleep(LOAD_THROTTLE_MS)
    }
  }
}

const setLayerCountByKey = (key: DemoLayerKey, count: number): void => {
  if (key === 'points') {
    status.pointCount = count
    return
  }
  if (key === 'lines') {
    status.lineCount = count
    return
  }
  if (key === 'polygons') {
    status.polygonCount = count
    return
  }
  status.trackPointCount = count
}

const ensureLayerEntities = async (
  key: DemoLayerKey,
  retryLoad: () => Promise<void>,
  failMessage: string
): Promise<boolean> => {
  const sourceId = SOURCE_IDS[key]
  let entityCount = getLayerEntityCount(sourceId)
  if (entityCount > 0) {
    setLayerCountByKey(key, entityCount)
    return true
  }

  await sleep(LOAD_THROTTLE_MS)
  await retryLoad()
  entityCount = getLayerEntityCount(sourceId)
  if (entityCount > 0) {
    setLayerCountByKey(key, entityCount)
    return true
  }

  setLayerCountByKey(key, 0)
  layerVisibility[key] = false
  status.lastAction = `${getDemoLayerLabel(key)}图层加载异常`
  setInteractionMessage(failMessage)
  return false
}

const runSecondaryLayerInspection = async (): Promise<void> => {
  if (!viewerReady.value || loading.value) {
    return
  }

  const missingLayerTasks: Array<() => Promise<void>> = []
  if (getLayerEntityCount(SOURCE_IDS.points) === 0 && status.pointCount > 0) {
    missingLayerTasks.push(handleGeneratePoints)
  }
  if (getLayerEntityCount(SOURCE_IDS.lines) === 0 && status.lineCount > 0) {
    missingLayerTasks.push(handleGenerateLines)
  }
  if (getLayerEntityCount(SOURCE_IDS.polygons) === 0 && status.polygonCount > 0) {
    missingLayerTasks.push(handleGeneratePolygons)
  }

  if (missingLayerTasks.length === 0) {
    return
  }

  status.lastAction = '检测到刷新后缺层，开始自动补建'
  setInteractionMessage(`检测到 ${missingLayerTasks.length} 个图层缺失，正在自动补建`)
  await runThrottledTasks(missingLayerTasks)
}

const scheduleSecondaryInspection = (): void => {
  if (secondaryInspectTimer) {
    clearTimeout(secondaryInspectTimer)
  }
  secondaryInspectTimer = setTimeout(() => {
    void runSecondaryLayerInspection()
  }, SECONDARY_INSPECT_DELAY_MS)
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value))
}

const formatBbox = (bbox: BBox): string => {
  return bbox.map((item) => item.toFixed(4)).join(', ')
}

const handleSwitchBaseLayer = (key: BaseLayerKey, silent = false): void => {
  const option = baseLayerOptions.find((item) => item.key === key)
  if (!option) {
    if (!silent) {
      setInteractionMessage('目标底图配置未启用，请检查底图配置文件')
    }
    return
  }

  const viewer = getViewerInstance()
  if (viewer) {
    layersSettingStore().setLayers(viewer, option.layerIds)
  }
  activeBaseLayer.value = option.key

  if (silent) {
    return
  }

  const applied = Boolean(viewer)
  status.lastAction = applied ? `已切换底图：${option.label}` : `底图将在地图初始化后生效：${option.label}`
  setInteractionMessage(
    applied ? `当前底图为 ${option.label}` : '底图配置已更新，等待地图初始化完成后应用'
  )
}

const handleToggleDemoLayer = (key: DemoLayerKey): void => {
  const sourceId = SOURCE_IDS[key]
  const layerName = getDemoLayerLabel(key)
  if (!hasLayer(sourceId)) {
    layerVisibility[key] = false
    setInteractionMessage(`${layerName}图层尚未生成，无法切换显示状态`)
    return
  }

  const nextVisible = !layerVisibility[key]
  const success = setLayerVisible(sourceId, nextVisible)
  if (!success) {
    setInteractionMessage(`${layerName}图层切换失败，请检查地图状态`)
    return
  }

  layerVisibility[key] = nextVisible
  status.lastAction = `${nextVisible ? '已显示' : '已隐藏'}${layerName}图层`
  setInteractionMessage(`${layerName}图层已${nextVisible ? '显示' : '隐藏'}`)
}

const getViewCenter = (): { longitude: number; latitude: number } | null => {
  const viewer = getViewerInstance()
  if (!viewer) {
    return null
  }

  const { scene, camera } = viewer
  const centerScreen = new Cartesian2(scene.canvas.clientWidth / 2, scene.canvas.clientHeight / 2)
  const centerCartesian = camera.pickEllipsoid(centerScreen, scene.globe.ellipsoid)

  if (centerCartesian) {
    const center = Cartographic.fromCartesian(centerCartesian)
    return {
      longitude: CesiumMath.toDegrees(center.longitude),
      latitude: CesiumMath.toDegrees(center.latitude),
    }
  }

  const fallback = camera.positionCartographic
  if (!fallback) {
    return null
  }

  return {
    longitude: CesiumMath.toDegrees(fallback.longitude),
    latitude: CesiumMath.toDegrees(fallback.latitude),
  }
}

const createBboxByCurrentLocation = (): BBox => {
  const center = getViewCenter()
  if (!center) {
    status.activeBbox = formatBbox(FALLBACK_BBOX)
    return FALLBACK_BBOX
  }

  const deltaLng = 0.25
  const deltaLat = 0.18
  const minLng = clamp(center.longitude - deltaLng, -180, 180)
  const maxLng = clamp(center.longitude + deltaLng, -180, 180)
  const minLat = clamp(center.latitude - deltaLat, -85, 85)
  const maxLat = clamp(center.latitude + deltaLat, -85, 85)
  const bbox: BBox = [minLng, minLat, maxLng, maxLat]
  status.activeBbox = formatBbox(bbox)
  return bbox
}

const handleHealthCheck = async (): Promise<void> => {
  const viewer = getViewerInstance()
  if (!viewer) {
    status.healthSummary = '异常'
    status.healthDetails = 'Viewer 不存在，地图未初始化或实例已销毁'
    setInteractionMessage('健康检查失败：Viewer 未就绪')
    return
  }

  const checks = {
    scene: Boolean(viewer.scene),
    camera: Boolean(viewer.camera),
    globe: Boolean(viewer.scene?.globe),
    canvas: Boolean(viewer.scene?.canvas),
    clock: Boolean(viewer.clock),
  }

  const dataSourcesCount = viewer.dataSources.length
  const imageryLayersCount = viewer.imageryLayers.length
  const entitiesCount = viewer.entities.values.length
  const requestRenderMode = Boolean(
    (viewer.scene as { requestRenderMode?: boolean }).requestRenderMode
  )

  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name)

  const isHealthy = failed.length === 0
  status.healthSummary = isHealthy ? '正常' : '异常'
  status.healthDetails = isHealthy
    ? `scene/camera/globe 正常，dataSources=${dataSourcesCount}，imageryLayers=${imageryLayersCount}，entities=${entitiesCount}，requestRenderMode=${requestRenderMode}`
    : `失败项：${failed.join(
        ', '
      )}；dataSources=${dataSourcesCount}，imageryLayers=${imageryLayersCount}，entities=${entitiesCount}`

  status.lastAction = '已执行 Cesium 健康检查'
  setInteractionMessage(isHealthy ? '健康检查通过：核心对象可用' : '健康检查异常：请查看体检详情')
}

const createPointEventHandlers = () => ({
  enable: true,
  highlightOnClick: true,
  highlightOnHover: true,
  flyToOnClick: true,
  clickStyle: {
    color: '#ffee58',
    pointSize: 13,
  },
  hoverStyle: {
    color: '#ffca28',
    pointSize: 11,
  },
  onClick: async (event: LayerInteractionEvent<GeoFeatureProperties>) => {
    const props = event.properties ?? {}
    setInteractionMessage(`点位点击：${String(props.name ?? props.id ?? 'unknown')}`)
  },
})

const createLineEventHandlers = () => ({
  enable: true,
  highlightOnClick: true,
  highlightOnHover: true,
  flyToOnClick: true,
  clickStyle: {
    strokeColor: '#ffee58',
    strokeWidth: 5,
  },
  hoverStyle: {
    strokeColor: '#ffd54f',
    strokeWidth: 4,
  },
  onClick: async (event: LayerInteractionEvent<GeoFeatureProperties>) => {
    const props = event.properties ?? {}
    setInteractionMessage(`轨迹点击：长度约 ${String(props.lineLengthKm ?? '--')} km`)
  },
})

const createPolygonEventHandlers = () => ({
  enable: true,
  highlightOnClick: true,
  highlightOnHover: true,
  fitBoundsOnClick: true,
  clickStyle: {
    fillColor: '#fff176',
    fillOpacity: 0.58,
    strokeColor: '#f57f17',
    strokeWidth: 3,
  },
  hoverStyle: {
    fillColor: '#ffecb3',
    fillOpacity: 0.46,
    strokeColor: '#ffb300',
    strokeWidth: 3,
  },
  onClick: async (event: LayerInteractionEvent<GeoFeatureProperties>) => {
    const props = event.properties ?? {}
    setInteractionMessage(`区域点击：面积 ${String(props.area ?? '--')} ㎡`)
  },
})

const handleGeneratePoints = async (): Promise<void> => {
  loading.value = true
  try {
    const bbox = createBboxByCurrentLocation()
    const points = createRandomPoints({
      count: 120,
      bbox,
      clusterTest: true,
      randomColor: true,
      id: 'demo-device',
      properties: (index) => ({
        name: `设备点-${index + 1}`,
        level: (index % 3) + 1,
      }),
    })

    const loadPoints = async () => {
      await addPointLayer({
        sourceId: SOURCE_IDS.points,
        data: points,
        style: {
          color: '#ffa726',
          strokeColor: '#ffffff',
          pointSize: 9,
        },
        events: createPointEventHandlers(),
      })
    }

    await loadPoints()
    const loaded = await ensureLayerEntities(
      'points',
      loadPoints,
      '点图层加载异常，请重试或切换底图后再生成'
    )
    if (!loaded) {
      return
    }

    layerVisibility.points = true
    status.lastAction = '已生成随机点'
    setInteractionMessage('已生成点图层，点击任一点位查看名称')
  } catch (error) {
    console.error('[GIS-DEMO] 点图层渲染失败', error)
    setInteractionMessage('点图层渲染失败，请检查数据与地图状态')
  } finally {
    loading.value = false
  }
}

const handleGenerateLines = async (): Promise<void> => {
  loading.value = true
  try {
    const bbox = createBboxByCurrentLocation()
    const lines = createRandomLines({
      count: 30,
      bbox,
      curve: true,
      mockTrack: true,
      id: 'demo-track',
      properties: (index) => ({
        routeName: `线路-${index + 1}`,
      }),
    })

    const loadLines = async () => {
      await addLineLayer({
        sourceId: SOURCE_IDS.lines,
        data: lines,
        style: {
          strokeColor: '#29b6f6',
          strokeWidth: 3,
        },
        events: createLineEventHandlers(),
      })
    }

    await loadLines()
    const loaded = await ensureLayerEntities(
      'lines',
      loadLines,
      '线图层加载异常，请重试或切换底图后再生成'
    )
    if (!loaded) {
      return
    }

    layerVisibility.lines = true
    status.lastAction = '已生成随机线'
    setInteractionMessage('已生成线图层，点击线路查看长度')
  } catch (error) {
    console.error('[GIS-DEMO] 线图层渲染失败', error)
    setInteractionMessage('线图层渲染失败，请检查数据与地图状态')
  } finally {
    loading.value = false
  }
}

const handleGeneratePolygons = async (): Promise<void> => {
  loading.value = true
  try {
    const bbox = createBboxByCurrentLocation()
    const polygons = createRandomPolygons({
      count: 8,
      bbox,
      randomColor: true,
      areaTest: true,
      validateGeometry: true,
      id: 'demo-warning',
      properties: (index) => ({
        areaName: `分区-${index + 1}`,
      }),
    })

    if (polygons.features.length === 0) {
      status.polygonCount = 0
      layerVisibility.polygons = false
      status.lastAction = '面生成失败'
      setInteractionMessage('随机面数据为空，请调整视角后重试')
      return
    }

    const loadPolygons = async () => {
      await addPolygonLayer({
        sourceId: SOURCE_IDS.polygons,
        data: polygons,
        style: {
          fillColor: '#ef5350',
          fillOpacity: 0.24,
          strokeColor: '#b71c1c',
          strokeWidth: 2,
          clampToGround: false,
        },
        events: createPolygonEventHandlers(),
      })
    }

    await loadPolygons()
    const loaded = await ensureLayerEntities(
      'polygons',
      loadPolygons,
      '面图层加载异常，请调整视角后重试'
    )
    if (!loaded) {
      return
    }

    layerVisibility.polygons = true
    status.lastAction = '已生成随机面'
    setInteractionMessage('已生成面图层，点击区域查看面积')
  } catch (error) {
    console.error('[GIS-DEMO] 面图层渲染失败', error)
    setInteractionMessage('面图层渲染失败，请检查数据与地图状态')
  } finally {
    loading.value = false
  }
}

const handleGenerateTrack = async (): Promise<void> => {
  loading.value = true
  try {
    const bbox = createBboxByCurrentLocation()
    const lines = createRandomLines({
      count: 1,
      bbox,
      curve: true,
      id: 'demo-track-base',
    })

    const route = lines.features?.[0]
    if (!route) {
      return
    }

    const track = createMovingTrack({
      id: 'car-replay-01',
      route,
      durationMs: 15000,
      fps: 20,
      loop: true,
      properties: {
        name: '轨迹回放车-01',
      },
    })

    const trackData = track.toFeatureCollection()

    const loadTrack = async () => {
      await addPointLayer({
        sourceId: SOURCE_IDS.track,
        data: trackData,
        style: {
          color: '#66bb6a',
          pointSize: 6,
        },
        events: createPointEventHandlers(),
      })
    }

    await loadTrack()
    const loaded = await ensureLayerEntities('track', loadTrack, '轨迹图层加载异常，请重试')
    if (!loaded) {
      return
    }

    layerVisibility.track = true
    status.lastAction = '已生成动态轨迹'
    setInteractionMessage('已生成轨迹帧点，可切换轨迹图层显隐')
  } catch (error) {
    console.error('[GIS-DEMO] 轨迹图层渲染失败', error)
    setInteractionMessage('轨迹图层渲染失败，请检查数据与地图状态')
  } finally {
    loading.value = false
  }
}

const handleGenerateMock = async (): Promise<void> => {
  loading.value = true
  try {
    const viewer = getViewerInstance()
    const bbox = createBboxByCurrentLocation()
    const points = mockDevicePoints(150, bbox)
    const lines = mockCarTracks(30, bbox)
    const polygons = mockWarningPolygons(8, bbox)

    await removeLayer(SOURCE_IDS.track, viewer ?? undefined)

    await runThrottledTasks([
      async () => {
        await addPointLayer({
          sourceId: SOURCE_IDS.points,
          data: points,
          style: {
            color: '#ffa726',
            strokeColor: '#ffffff',
            pointSize: 9,
          },
          events: createPointEventHandlers(),
        })
      },
      async () => {
        await addLineLayer({
          sourceId: SOURCE_IDS.lines,
          data: lines,
          style: {
            strokeColor: '#29b6f6',
            strokeWidth: 3,
          },
          events: createLineEventHandlers(),
        })
      },
      async () => {
        await addPolygonLayer({
          sourceId: SOURCE_IDS.polygons,
          data: polygons,
          style: {
            fillColor: '#ef5350',
            fillOpacity: 0.24,
            strokeColor: '#b71c1c',
            strokeWidth: 2,
            clampToGround: false,
          },
          events: createPolygonEventHandlers(),
        })
      },
    ])

    status.pointCount = points.features.length
    status.lineCount = lines.features.length
    status.polygonCount = polygons.features.length
    status.trackPointCount = 0
    layerVisibility.points = true
    layerVisibility.lines = true
    layerVisibility.polygons = true
    layerVisibility.track = false
    status.lastAction = '已加载 Mock GIS 数据'
    setInteractionMessage('已加载 Mock 点线面数据，轨迹图层已清空')
  } catch (error) {
    console.error('[GIS-DEMO] Mock 图层渲染失败', error)
    setInteractionMessage('Mock 图层渲染失败，请检查数据与地图状态')
  } finally {
    loading.value = false
  }
}

const handleClear = async (viewer = getViewerInstance()): Promise<void> => {
  loading.value = true
  try {
    await Promise.all([
      removeLayer(SOURCE_IDS.points, viewer ?? undefined),
      removeLayer(SOURCE_IDS.lines, viewer ?? undefined),
      removeLayer(SOURCE_IDS.polygons, viewer ?? undefined),
      removeLayer(SOURCE_IDS.track, viewer ?? undefined),
    ])

    status.pointCount = 0
    status.lineCount = 0
    status.polygonCount = 0
    status.trackPointCount = 0
    setAllDemoLayerVisibility(false)
    status.lastAction = '已清空全部图层'
    setInteractionMessage('已清空图层，点击按钮重新生成')
  } catch (error) {
    console.error('[GIS-DEMO] 图层清空失败', error)
  } finally {
    loading.value = false
  }
}

const handleReset = async (): Promise<void> => {
  await handleClear()
  await runThrottledTasks([handleGeneratePoints, handleGenerateLines, handleGeneratePolygons])
  status.lastAction = '已重置默认演示场景'
  setInteractionMessage('默认演示场景已恢复：点、线、面图层已显示')
}

const unsubscribe = onCesiumViewerReady(async () => {
  viewerReady.value = true
  status.activeBbox = formatBbox(FALLBACK_BBOX)
  setInteractionMessage('地图已就绪，可开始交互演示')
  await nextTick()
  handleSwitchBaseLayer(activeBaseLayer.value, true)
  await handleReset()
  scheduleSecondaryInspection()
})

onBeforeUnmount(() => {
  const viewer = getViewerInstance()
  if (secondaryInspectTimer) {
    clearTimeout(secondaryInspectTimer)
    secondaryInspectTimer = null
  }
  unsubscribe()
  void handleClear(viewer)
})

const demoActions: ToolbarAction[] = [
  {
    key: 'points',
    label: '点生成',
    remark: '设备散点',
    tone: 'point',
    handler: handleGeneratePoints,
  },
  { key: 'lines', label: '线生成', remark: '模拟线路', tone: 'line', handler: handleGenerateLines },
  {
    key: 'polygons',
    label: '面生成',
    remark: '预警区域',
    tone: 'polygon',
    handler: handleGeneratePolygons,
  },
  {
    key: 'track',
    label: '动态轨迹',
    remark: '回放帧点',
    tone: 'track',
    handler: handleGenerateTrack,
  },
  {
    key: 'mock',
    label: 'Mock 数据',
    remark: '业务样例',
    tone: 'mock',
    handler: handleGenerateMock,
  },
  { key: 'clear', label: '清空', remark: '移除图层', tone: 'danger', handler: handleClear },
  { key: 'reset', label: '重置', remark: '默认场景', tone: 'reset', handler: handleReset },
]

const isActionDisabled = (_action: ToolbarAction): boolean => {
  return !viewerReady.value || loading.value
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
