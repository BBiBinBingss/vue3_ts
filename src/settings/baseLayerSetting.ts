export type BaseLayerProviderType = 'tdt-wmts' | 'url-template'

export interface BaseLayerProviderConfig {
  id: string
  name: string
  enabled?: boolean
  providerType: BaseLayerProviderType
  layer?: string
  url?: string
  style?: string
  tileMatrixSetID?: string
  subdomains?: string[]
  minimumLevel?: number
  maximumLevel?: number
  tilingScheme?: 'webMercator' | 'geographic'
  enablePickFeatures?: boolean
}

export interface BaseLayerOption {
  key: string
  label: string
  enabled?: boolean
  layerIds: string[]
}

export const DEFAULT_BASE_LAYER_OPTION_KEY = 'gaodeVector'

export const BASE_LAYER_PROVIDER_CONFIGS: BaseLayerProviderConfig[] = [
  {
    id: 'vec',
    name: '天地图矢量底图',
    enabled: false,
    providerType: 'tdt-wmts',
    layer: 'vec',
  },
  {
    id: 'cva',
    name: '天地图矢量注记',
    enabled: false,
    providerType: 'tdt-wmts',
    layer: 'cva',
  },
  {
    id: 'img',
    name: '天地图影像底图',
    enabled: false,
    providerType: 'tdt-wmts',
    layer: 'img',
  },
  {
    id: 'cia',
    name: '天地图影像注记',
    enabled: false,
    providerType: 'tdt-wmts',
    layer: 'cia',
  },
  {
    id: 'gaode-vec',
    name: '高德矢量底图',
    enabled: true,
    providerType: 'url-template',
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    subdomains: ['1', '2', '3', '4'],
  },
  {
    id: 'gaode-img',
    name: '高德影像底图',
    enabled: true,
    providerType: 'url-template',
    url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    subdomains: ['1', '2', '3', '4'],
  },
  {
    id: 'baidu-vec',
    name: '百度矢量底图',
    enabled: false,
    providerType: 'url-template',
    url: 'https://maponline{s}.bdimg.com/tile/?qt=tile&x={x}&y={reverseY}&z={z}&styles=pl&scaler=1&p=1',
    subdomains: ['0', '1', '2', '3'],
  },
  {
    id: 'tencent-vec',
    name: '腾讯矢量底图',
    enabled: false,
    providerType: 'url-template',
    url: 'https://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid=1&version=297',
    subdomains: ['0', '1', '2', '3'],
  },
]

export const BASE_LAYER_OPTIONS: BaseLayerOption[] = [
  { key: 'vector', label: '天地图矢量', enabled: false, layerIds: ['vec', 'cva'] },
  { key: 'image', label: '天地图影像', enabled: false, layerIds: ['img', 'cia'] },
  { key: 'imageOnly', label: '天地图影像无注记', enabled: false, layerIds: ['img'] },
  { key: 'gaodeVector', label: '高德矢量', layerIds: ['gaode-vec'] },
  { key: 'gaodeImage', label: '高德影像', layerIds: ['gaode-img'] },
  { key: 'baiduVector', label: '百度矢量', enabled: false, layerIds: ['baidu-vec'] },
  { key: 'tencentVector', label: '腾讯矢量', enabled: false, layerIds: ['tencent-vec'] },
  { key: 'none', label: '隐藏', layerIds: [] },
]

export const getEnabledBaseLayerProviderConfigs = (): BaseLayerProviderConfig[] => {
  return BASE_LAYER_PROVIDER_CONFIGS.filter((item) => item.enabled !== false)
}

export const getEnabledBaseLayerOptions = (): BaseLayerOption[] => {
  return BASE_LAYER_OPTIONS.filter((item) => item.enabled !== false)
}
