/**
 * layer 模块方法集合。
 *
 * 提供底图构建与切换能力：
 * - 自动识别天地图配置
 * - 构建 WMTS / OSM 底图
 * - 提供预设列表与切换方法
 */
import TileLayer from 'ol/layer/Tile'
import type Map from 'ol/Map'
import OSM from 'ol/source/OSM'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { getTopLeft, getWidth } from 'ol/extent'
import { get as getProjection } from 'ol/proj'
import type { BaseLayerRecord, BaseMapPresetOption, BaseMapPresetKey, TdtConfig } from './types'

const normalizeEnvValue = (value: string | undefined) => value?.replace(/^['"]|['"]$/g, '') ?? ''

/** 读取并校验天地图配置。 */
function getTdtConfig(): TdtConfig | null {
  const baseUrl = normalizeEnvValue(import.meta.env.VITE_APP_TDT_URL)
  const token = normalizeEnvValue(import.meta.env.VITE_APP_TOKEN)

  if (!baseUrl || !token) {
    return null
  }

  return { baseUrl, token }
}

/**
 * 创建天地图 WMTS 图层。
 * @param className 图层 className（用于后续按名称显隐控制）
 * @param visible 初始是否可见
 * @param zIndex 图层层级
 * @param url WMTS 请求地址
 * @param layerName WMTS 图层名（vec/img/ter 等）
 * @param wrapX 是否跨经度重复
 */
function createTdtLayer(
  className: string,
  visible: boolean,
  zIndex: number,
  url: string,
  layerName: string,
  wrapX: boolean,
) {
  const projection = getProjection('EPSG:4326')
  const projectionExtent = projection?.getExtent()
  const size = projectionExtent ? getWidth(projectionExtent) / 256 : 0
  const resolutions: number[] = []
  const matrixIds: string[] = []

  for (let zoomLevel = 0; zoomLevel < 19; zoomLevel += 1) {
    resolutions[zoomLevel] = size / 2 ** zoomLevel
    matrixIds[zoomLevel] = `${zoomLevel}`
  }

  return new TileLayer({
    className,
    visible,
    zIndex,
    source: new WMTS({
      url,
      layer: layerName,
      format: 'tiles',
      projection: projection ?? 'EPSG:4326',
      matrixSet: 'c',
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent!),
        resolutions,
        matrixIds,
      }),
      style: 'default',
      wrapX,
      crossOrigin: 'anonymous',
    }),
  })
}

/** 创建 OSM 图层（天地图不可用时的兜底底图）。 */
function createOsmLayer() {
  return new TileLayer({
    className: '开放街图',
    visible: true,
    zIndex: 0,
    source: new OSM(),
  })
}

/** 获取默认底图可见图层集合。 */
export function getDefaultVisibleBaseLayerNames() {
  return getTdtConfig() ? ['矢量图', '矢量图标注'] : ['开放街图']
}

/**
 * 获取可用底图预设。
 *
 * - 有天地图配置：返回矢量/影像/地形/OSM
 * - 无天地图配置：仅返回 OSM
 */
export function getAvailableBaseMapPresets(): BaseMapPresetOption[] {
  if (!getTdtConfig()) {
    return [
      {
        key: 'osm',
        label: 'OSM',
        layerNames: ['开放街图'],
      },
    ]
  }

  return [
    {
      key: 'vector',
      label: '矢量图',
      layerNames: ['矢量图', '矢量图标注'],
    },
    {
      key: 'image',
      label: '影像图',
      layerNames: ['影像图', '影像图标注'],
    },
    {
      key: 'terrain',
      label: '地形图',
      layerNames: ['地形图', '地形图标注'],
    },
    {
      key: 'osm',
      label: 'OSM',
      layerNames: ['开放街图'],
    },
  ]
}

/**
 * 创建全部底图图层。
 *
 * 返回值 key 对应图层 className，便于显隐切换统一控制。
 */
export function createBaseLayers(): BaseLayerRecord {
  const tdtConfig = getTdtConfig()

  if (!tdtConfig) {
    return {
      开放街图: createOsmLayer(),
    }
  }

  const { baseUrl, token } = tdtConfig

  return {
    矢量图: createTdtLayer('矢量图', false, -1, `${baseUrl}/vec_c/wmts?tk=${token}`, 'vec', true),
    矢量图标注: createTdtLayer(
      '矢量图标注',
      false,
      1,
      `${baseUrl}/cva_c/wmts?tk=${token}`,
      'cva',
      true,
    ),
    影像图: createTdtLayer('影像图', false, -1, `${baseUrl}/img_c/wmts?tk=${token}`, 'img', true),
    影像图标注: createTdtLayer(
      '影像图标注',
      false,
      1,
      `${baseUrl}/cia_c/wmts?tk=${token}`,
      'cia',
      true,
    ),
    地形图: createTdtLayer('地形图', false, -1, `${baseUrl}/ter_c/wmts?tk=${token}`, 'ter', true),
    地形图标注: createTdtLayer(
      '地形图标注',
      false,
      1,
      `${baseUrl}/cta_c/wmts?tk=${token}`,
      'cta',
      true,
    ),
  }
}

/**
 * 按图层名称切换底图显隐。
 * @param map 地图实例
 * @param visibleLayerNames 需要显示的底图名称列表
 */
export function toggleBaseLayerVisibility(map: Map, visibleLayerNames: string[]) {
  const layers = map.getLayers().getArray()

  layers.forEach((layer) => {
    const layerName = layer.getClassName()
    const isNamedLayer = /^[\u4E00-\u9FFF]+$/.test(layerName)

    if (!isNamedLayer) {
      return
    }

    layer.setVisible(visibleLayerNames.includes(layerName))
  })
}

/**
 * 切换底图预设。
 * @returns 成功时返回切换后的预设 key，失败返回 null。
 */
export function switchBaseMapPreset(
  map: Map,
  presetKey: BaseMapPresetKey,
): BaseMapPresetKey | null {
  const preset = getAvailableBaseMapPresets().find((item) => item.key === presetKey)

  if (!preset) {
    return null
  }

  toggleBaseLayerVisibility(map, preset.layerNames)
  return preset.key
}
