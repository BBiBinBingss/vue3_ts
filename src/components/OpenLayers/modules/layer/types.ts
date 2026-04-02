/**
 * 底图图层类型（支持 OSM 与 WMTS 两类 source）。
 */
import type TileLayer from 'ol/layer/Tile'
import type WMTS from 'ol/source/WMTS'
import type OSM from 'ol/source/OSM'

/** 可用于底图展示的 TileLayer 联合类型。 */
export type BaseTileLayer = TileLayer<WMTS | OSM>

/** 底图字典：key 为图层名（className），value 为图层对象。 */
export type BaseLayerRecord = Record<string, BaseTileLayer>

/** 天地图服务配置。 */
export interface TdtConfig {
  /** 天地图基础地址（例如 https://t{s}.tianditu.gov.cn）。 */
  baseUrl: string
  /** 天地图访问令牌。 */
  token: string
}

/** 底图预设主键。 */
export type BaseMapPresetKey = 'vector' | 'image' | 'terrain' | 'osm'

/** 底图预设项，用于页面切换按钮与逻辑映射。 */
export interface BaseMapPresetOption {
  /** 预设唯一键。 */
  key: BaseMapPresetKey
  /** 展示名称。 */
  label: string
  /** 该预设需要打开的底图图层名称集合。 */
  layerNames: string[]
}
