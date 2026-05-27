import * as Cesium from 'cesium'

type LayerProviderLike = {
  layer?: string
  _layer?: string
}

// 天地图URL前缀
const TDT_URL_PREFIX = 'http://{s}.tianditu.gov.cn'
// 天地图支持的子域
const SUBDOMAINS = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']

// 定义图层配置接口
interface TileConfig {
  className: string // 图层名称
  layer: string // 图层类型
}

/**
 * 根据提供的图层配置创建Cesium瓦片图层
 * @param {TileConfig} 参数包含图层名称和类型
 * @returns 返回Cesium的WebMapTileServiceImageryProvider实例
 */
const createTile = ({ className, layer }: TileConfig) => {
  return new Cesium.WebMapTileServiceImageryProvider({
    url: `${TDT_URL_PREFIX}/${layer}_w/wmts?tk=${import.meta.env.VITE_APP_TOKEN}`, // 图层URL
    layer: layer,
    style: 'default',
    tileMatrixSetID: 'w',
    subdomains: SUBDOMAINS,
    credit: new Cesium.Credit(className),
  })
}

// 定义要创建的图层的配置列表
const LAYER_CONFIGS: TileConfig[] = [
  { layer: 'img', className: '影像底图' },
  { layer: 'cia', className: '影像注记' },
  { layer: 'vec', className: '矢量底图' },
  { layer: 'cva', className: '矢量注记' },
]

// 根据上述配置创建图层列表
export const layers = LAYER_CONFIGS.map((config) => createTile(config))

export const getProviderLayerId = (provider: unknown): string | undefined => {
  if (!provider || typeof provider !== 'object') {
    return undefined
  }

  const layerProvider = provider as LayerProviderLike
  return layerProvider.layer ?? layerProvider._layer
}

export const setVisibleBaseLayers = (viewer: Cesium.Viewer, activeLayerIds: string[]): void => {
  const activeLayerSet = new Set(activeLayerIds)
  const imageryLayers = viewer.imageryLayers

  for (let i = 0; i < imageryLayers.length; i++) {
    const imageryLayer = imageryLayers.get(i)
    const layerId = getProviderLayerId(imageryLayer.imageryProvider)
    imageryLayer.show = !!layerId && activeLayerSet.has(layerId)
  }

  viewer.scene?.requestRender()
}
