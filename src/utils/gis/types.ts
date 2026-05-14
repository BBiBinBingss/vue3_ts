import type {
  BBox,
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  Point,
  Position,
} from 'geojson'
import type { Cartesian2, Entity, Viewer } from 'cesium'

/**
 * 数据来源类型。
 */
export type SourceType = 'mock' | 'simulation' | 'api' | 'manual'

/**
 * GIS 要素元信息。
 */
export interface GeoFeatureMetadata {
  sourceType?: SourceType
  timestamp?: number
  debug?: boolean
  [key: string]: string | number | boolean | undefined
}

/**
 * 地图样式结构。
 */
export interface MapFeatureStyle {
  color?: string
  fillColor?: string
  fillOpacity?: number
  strokeColor?: string
  strokeWidth?: number
  pointSize?: number
  clampToGround?: boolean
}

/**
 * 统一业务属性结构，可继续扩展。
 */
export type GeoFeatureProperties = {
  id?: string
  name?: string
  color?: string
  __style?: MapFeatureStyle
  __metadata?: GeoFeatureMetadata
  [key: string]: unknown
}

/**
 * 带 metadata 的 Feature。
 */
export type FeatureWithMeta<G extends Geometry, P extends GeoFeatureProperties> = Feature<G, P> & {
  metadata?: GeoFeatureMetadata
}

/**
 * 带 metadata 的 FeatureCollection。
 */
export type FeatureCollectionWithMeta<
  G extends Geometry,
  P extends GeoFeatureProperties
> = FeatureCollection<G, P> & {
  metadata?: GeoFeatureMetadata
}

/**
 * 单要素工厂配置。
 */
export interface GeoFactoryOptions<P extends GeoFeatureProperties> {
  id?: string
  properties?: Partial<P>
  metadata?: GeoFeatureMetadata
  style?: MapFeatureStyle
  sourceType?: SourceType
  timestamp?: number
}

/**
 * 要素集合工厂配置。
 */
export interface GeoCollectionFactoryOptions<P extends GeoFeatureProperties> {
  metadata?: GeoFeatureMetadata
  style?: MapFeatureStyle
  sourceType?: SourceType
  timestamp?: number
  sharedProperties?: Partial<P>
}

/**
 * 随机要素公共配置。
 */
export interface RandomBaseOptions<P extends GeoFeatureProperties> {
  count?: number
  bbox?: BBox
  properties?: Partial<P> | ((index: number) => Partial<P>)
  id?: string
  offset?: [number, number]
  debug?: boolean
  metadata?: GeoFeatureMetadata
  sourceType?: SourceType
  timestamp?: number
}

/**
 * 随机点配置。
 */
export interface RandomPointOptions<P extends GeoFeatureProperties = GeoFeatureProperties>
  extends RandomBaseOptions<P> {
  randomColor?: boolean
  clusterTest?: boolean
}

/**
 * 随机线配置。
 */
export interface RandomLineOptions<P extends GeoFeatureProperties = GeoFeatureProperties>
  extends RandomBaseOptions<P> {
  maxVertices?: number
  maxLength?: number
  curve?: boolean
  style?: MapFeatureStyle
  mockTrack?: boolean
}

/**
 * 随机面配置。
 */
export interface RandomPolygonOptions<P extends GeoFeatureProperties = GeoFeatureProperties>
  extends RandomBaseOptions<P> {
  numVertices?: number
  maxRadialLength?: number
  randomColor?: boolean
  areaTest?: boolean
  validateGeometry?: boolean
}

/**
 * 动态轨迹配置。
 */
export interface MovingTrackOptions<P extends GeoFeatureProperties = GeoFeatureProperties> {
  id?: string
  route: Feature<LineString, P> | Position[]
  durationMs?: number
  fps?: number
  startTime?: number
  loop?: boolean
  properties?: Partial<P>
  metadata?: GeoFeatureMetadata
}

/**
 * 轨迹帧。
 */
export interface MovingTrackFrame<P extends GeoFeatureProperties = GeoFeatureProperties> {
  index: number
  timestamp: number
  feature: Feature<Point, P>
}

/**
 * 动态轨迹结果。
 */
export interface MovingTrackResult<P extends GeoFeatureProperties = GeoFeatureProperties> {
  id: string
  durationMs: number
  fps: number
  loop: boolean
  frames: MovingTrackFrame<P>[]
  getFrameAt: (timestamp: number) => MovingTrackFrame<P>
  toFeatureCollection: () => FeatureCollection<Point, P>
}

/**
 * Cesium 图层入参。
 */
export interface CesiumLayerOptions<G extends Geometry, P extends GeoFeatureProperties> {
  sourceId: string
  layerId?: string
  data: FeatureCollection<G, P>
  style?: MapFeatureStyle
  flyTo?: boolean
  events?: LayerEventHandlers<P>
}

/**
 * 图层交互事件上下文。
 */
export interface LayerInteractionEvent<P extends GeoFeatureProperties> {
  sourceId: string
  layerId: string
  viewer: Viewer
  entity: Entity
  position?: Cartesian2
  properties?: P
  flyTo: () => Promise<void>
  fitBounds: () => Promise<void>
  highlight: () => void
}

/**
 * 图层交互配置。
 */
export interface LayerEventHandlers<P extends GeoFeatureProperties> {
  enable?: boolean
  highlightOnClick?: boolean
  highlightOnHover?: boolean
  flyToOnClick?: boolean
  fitBoundsOnClick?: boolean
  clickStyle?: MapFeatureStyle
  hoverStyle?: MapFeatureStyle
  onClick?: (event: LayerInteractionEvent<P>) => void | Promise<void>
  onHover?: (event: LayerInteractionEvent<P>) => void | Promise<void>
}

/**
 * 地图图层句柄，提供更新与销毁能力。
 */
export interface MapLayerHandle<G extends Geometry, P extends GeoFeatureProperties> {
  sourceId: string
  layerId: string
  data: FeatureCollection<G, P>
  destroy: () => Promise<void>
  update: (next: FeatureCollection<G, P>) => Promise<void>
}
