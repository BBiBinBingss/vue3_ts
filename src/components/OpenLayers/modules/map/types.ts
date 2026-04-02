/**
 * map 模块类型定义。
 *
 * 本文件聚合地图实例上下文、mock 要素结构、视图配置等核心类型，
 * 供组件层与业务页面统一引用。
 */
import type Map from 'ol/Map'
import type Feature from 'ol/Feature'
import type Geometry from 'ol/geom/Geometry'
import type VectorLayer from 'ol/layer/Vector'
import type VectorSource from 'ol/source/Vector'

/** 业务 mock 几何类型。 */
export type MockGeometryType = 'point' | 'line' | 'polygon'

/** 地图视图基础配置。 */
export interface MapViewSettings {
  /** 地图投影标识，如 `EPSG:4326`。 */
  projection: string
  /** 初始中心点。 */
  center: [number, number]
  /** 初始缩放。 */
  zoom: number
  /** 最大缩放级别。 */
  maxZoom?: number
  /** 最小缩放级别。 */
  minZoom?: number
}

/** 创建地图时的入参。 */
export interface OpenLayersMapOptions {
  /** 挂载目标（元素 id 或 HTMLElement）。 */
  target: string | HTMLElement
  /** 视图配置，可按需覆盖默认值。 */
  view?: Partial<MapViewSettings>
  /** 初始底图可见图层名集合。 */
  visibleBaseLayers?: string[]
}

/** 地图上下文：包含地图实例、分图层 source/layer。 */
export interface MapContext {
  /** OpenLayers 地图实例。 */
  map: Map
  /** 点要素数据源。 */
  pointSource: VectorSource<Feature<Geometry>>
  /** 线要素数据源。 */
  lineSource: VectorSource<Feature<Geometry>>
  /** 面要素数据源。 */
  polygonSource: VectorSource<Feature<Geometry>>
  /** 点要素图层。 */
  pointLayer: VectorLayer<VectorSource<Feature<Geometry>>>
  /** 线要素图层。 */
  lineLayer: VectorLayer<VectorSource<Feature<Geometry>>>
  /** 面要素图层。 */
  polygonLayer: VectorLayer<VectorSource<Feature<Geometry>>>
}

/** mock 生成配置。 */
export interface MockLoadOptions {
  /** 生成点数量。 */
  pointCount?: number
  /** 生成线数量。 */
  lineCount?: number
  /** 生成面数量。 */
  polygonCount?: number
}

/** mock 全量项（含 feature 引用，用于飞行/定位等操作）。 */
export interface MockFeatureItem {
  /** mock 唯一 id。 */
  id: string
  /** mock 几何类型。 */
  type: MockGeometryType
  /** 类型中文标签。 */
  typeLabel: string
  /** 名称。 */
  name: string
  /** 描述。 */
  description: string
  /** OpenLayers feature 对象。 */
  feature: Feature<Geometry>
}

/** mock 展示项（不含 feature，供 UI 面板渲染）。 */
export interface MockDisplayItem {
  /** mock 唯一 id。 */
  id: string
  /** mock 几何类型。 */
  type: MockGeometryType
  /** 类型中文标签。 */
  typeLabel: string
  /** 名称。 */
  name: string
  /** 描述。 */
  description: string
}
