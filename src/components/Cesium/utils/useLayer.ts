import * as Cesium from 'cesium'
import {
  getEnabledBaseLayerProviderConfigs,
  type BaseLayerProviderConfig,
} from '/@/settings/baseLayerSetting'

type LayerProviderLike = {
  layer?: string
  _layer?: string
}

const providerIdStore = new WeakMap<object, string>()

// 天地图URL前缀
const TDT_URL_PREFIX = 'https://{s}.tianditu.gov.cn'
// 天地图支持的子域
const SUBDOMAINS = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']

const resolveTilingScheme = (type?: BaseLayerProviderConfig['tilingScheme']) => {
  if (type === 'geographic') {
    return new Cesium.GeographicTilingScheme()
  }
  return new Cesium.WebMercatorTilingScheme()
}

const setProviderId = (provider: Cesium.ImageryProvider, id: string): Cesium.ImageryProvider => {
  providerIdStore.set(provider as unknown as object, id)
  return provider
}

/**
 * 按配置创建底图 provider。
 */
const createProvider = (config: BaseLayerProviderConfig): Cesium.ImageryProvider => {
  if (config.providerType === 'tdt-wmts') {
    const layer = config.layer ?? ''
    const token = import.meta.env.VITE_APP_TOKEN ?? ''
    return setProviderId(
      new Cesium.WebMapTileServiceImageryProvider({
        url: `${TDT_URL_PREFIX}/${layer}_w/wmts?tk=${token}`,
        layer,
        style: config.style ?? 'default',
        tileMatrixSetID: config.tileMatrixSetID ?? 'w',
        subdomains: config.subdomains ?? SUBDOMAINS,
        minimumLevel: config.minimumLevel,
        maximumLevel: config.maximumLevel,
        credit: new Cesium.Credit(config.name),
      }),
      config.id
    )
  }

  return setProviderId(
    new Cesium.UrlTemplateImageryProvider({
      url: config.url ?? '',
      subdomains: config.subdomains,
      minimumLevel: config.minimumLevel,
      maximumLevel: config.maximumLevel,
      tilingScheme: resolveTilingScheme(config.tilingScheme),
      enablePickFeatures: config.enablePickFeatures ?? false,
      credit: new Cesium.Credit(config.name),
    }),
    config.id
  )
}

export const baseLayerProviders = getEnabledBaseLayerProviderConfigs().map((config) =>
  createProvider(config)
)

export const getProviderLayerId = (provider: unknown): string | undefined => {
  if (!provider || typeof provider !== 'object') {
    return undefined
  }

  const customId = providerIdStore.get(provider as object)
  if (customId) {
    return customId
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
