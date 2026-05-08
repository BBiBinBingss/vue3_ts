import {
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  CustomDataSource,
  GeoJsonDataSource,
  type DataSource,
  type Entity,
  type Viewer,
} from 'cesium'
import type { Feature, FeatureCollection, Geometry, LineString, Point, Polygon } from 'geojson'
import { getViewerInstance } from '../../../components/Cesium/utils/viewerRegistry'
import { createLayerRegistry } from './layerRegistry'
import type {
  CesiumLayerOptions,
  GeoFeatureProperties,
  MapFeatureStyle,
  MapLayerHandle,
} from '../types'

/**
 * 按 Viewer 维度缓存图层注册表，确保多实例场景互不影响。
 */
const layerStore = new WeakMap<Viewer, ReturnType<typeof createLayerRegistry<DataSource>>>()

/**
 * 统一解析 Viewer。
 * - 优先使用调用方传入实例
 * - 否则尝试读取全局注册实例
 * - 若仍不可用则返回 null，由上层走安全降级
 */
const resolveViewer = (viewer?: Viewer): Viewer | null => {
  return viewer ?? getViewerInstance()
}

/**
 * 获取或创建指定 Viewer 的图层注册容器。
 */
const getStore = (viewer: Viewer) => {
  const existed = layerStore.get(viewer)
  if (existed) {
    return existed
  }
  const created = createLayerRegistry<DataSource>()
  layerStore.set(viewer, created)
  return created
}

/**
 * 将 CSS 颜色值转换为 Cesium Color。
 * @param color 输入颜色
 * @param fallback 默认颜色
 * @param alpha 透明度
 */
const toCesiumColor = (color?: string, fallback = '#409eff', alpha = 1): Color => {
  const next = Color.fromCssColorString(color ?? fallback)
  return next.withAlpha(alpha)
}

/**
 * 给加载后的实体统一设置样式。
 * 说明：Cesium 实体属性多数是 Property 类型，这里统一使用 ConstantProperty 包装。
 */
const applyStyle = (dataSource: DataSource, style: MapFeatureStyle = {}): void => {
  const entities = (dataSource as CustomDataSource).entities.values as Entity[]
  entities.forEach((entity) => {
    if (entity.point) {
      entity.point.pixelSize = new ConstantProperty(style.pointSize ?? 8)
      entity.point.color = new ConstantProperty(toCesiumColor(style.color))
      entity.point.outlineColor = new ConstantProperty(
        toCesiumColor(style.strokeColor ?? '#ffffff')
      )
      entity.point.outlineWidth = new ConstantProperty(style.strokeWidth ?? 1)
      entity.point.disableDepthTestDistance = new ConstantProperty(Number.POSITIVE_INFINITY)
    }

    if (entity.polyline) {
      entity.polyline.width = new ConstantProperty(style.strokeWidth ?? 3)
      entity.polyline.material = new ColorMaterialProperty(
        toCesiumColor(style.strokeColor ?? style.color ?? '#00bcd4')
      )
      entity.polyline.clampToGround = new ConstantProperty(style.clampToGround ?? true)
    }

    if (entity.polygon) {
      entity.polygon.material = new ColorMaterialProperty(
        toCesiumColor(style.fillColor, '#4caf50', style.fillOpacity ?? 0.32)
      )
      entity.polygon.outline = new ConstantProperty(true)
      entity.polygon.outlineColor = new ConstantProperty(
        toCesiumColor(style.strokeColor ?? '#2e7d32')
      )
      entity.polygon.outlineWidth = new ConstantProperty(style.strokeWidth ?? 2)
      entity.polygon.perPositionHeight = new ConstantProperty(false)
    }
  })
}

/**
 * 创建空操作句柄，用于 map 未初始化或数据不可用时的兜底。
 */
const createNoopHandle = <G extends Geometry, P extends GeoFeatureProperties>(
  sourceId: string,
  layerId: string,
  data: FeatureCollection<G, P>
): MapLayerHandle<G, P> => {
  return {
    sourceId,
    layerId,
    data,
    destroy: async () => undefined,
    update: async () => undefined,
  }
}

const upsertLayer = async <G extends Geometry, P extends GeoFeatureProperties>(
  options: CesiumLayerOptions<G, P> & { viewer?: Viewer }
): Promise<MapLayerHandle<G, P>> => {
  const sourceId = options.sourceId
  const layerId = options.layerId ?? options.sourceId
  const viewer = resolveViewer(options.viewer)
  if (!viewer) {
    return createNoopHandle(sourceId, layerId, options.data)
  }

  if (!options.data || !Array.isArray(options.data.features)) {
    return createNoopHandle(sourceId, layerId, options.data)
  }

  const store = getStore(viewer)

  const existed = store.get(sourceId)
  if (options.data.features.length === 0) {
    if (existed) {
      await viewer.dataSources.remove(existed, true)
      store.remove(sourceId)
    }
    return createNoopHandle(sourceId, layerId, options.data)
  }

  if (existed) {
    await viewer.dataSources.remove(existed, true)
    store.remove(sourceId)
  }

  let loaded: GeoJsonDataSource
  try {
    loaded = await GeoJsonDataSource.load(options.data as unknown as FeatureCollection | Feature, {
      clampToGround: options.style?.clampToGround ?? true,
      markerColor: toCesiumColor(options.style?.color),
      markerSize: options.style?.pointSize ?? 8,
      stroke: toCesiumColor(options.style?.strokeColor ?? options.style?.color),
      strokeWidth: options.style?.strokeWidth ?? 3,
      fill: toCesiumColor(options.style?.fillColor, '#4caf50', options.style?.fillOpacity ?? 0.35),
    })
  } catch (error) {
    console.error('[GIS-CESIUM] GeoJSON 加载失败', error)
    return createNoopHandle(sourceId, layerId, options.data)
  }

  loaded.name = layerId
  viewer.dataSources.add(loaded)
  applyStyle(loaded, options.style)
  store.set(sourceId, loaded)

  if (options.flyTo) {
    await viewer.flyTo(loaded)
  }

  const destroy = async () => {
    const current = store.get(sourceId)
    if (!current) {
      return
    }
    await viewer.dataSources.remove(current, true)
    store.remove(sourceId)
  }

  const update = async (next: FeatureCollection<G, P>) => {
    await upsertLayer({ ...options, data: next, viewer })
  }

  return {
    sourceId,
    layerId,
    data: options.data,
    destroy,
    update,
  }
}

export function addPointLayer<P extends GeoFeatureProperties>(
  options: CesiumLayerOptions<Point, P> & { viewer?: Viewer }
): Promise<MapLayerHandle<Point, P>> {
  return upsertLayer(options)
}

export function addLineLayer<P extends GeoFeatureProperties>(
  options: CesiumLayerOptions<LineString, P> & { viewer?: Viewer }
): Promise<MapLayerHandle<LineString, P>> {
  return upsertLayer(options)
}

export function addPolygonLayer<P extends GeoFeatureProperties>(
  options: CesiumLayerOptions<Polygon, P> & { viewer?: Viewer }
): Promise<MapLayerHandle<Polygon, P>> {
  return upsertLayer(options)
}

export async function removeLayer(sourceId: string, viewer?: Viewer): Promise<void> {
  const resolvedViewer = resolveViewer(viewer)
  if (!resolvedViewer) {
    return
  }
  const store = getStore(resolvedViewer)
  const source = store.get(sourceId)
  if (!source) {
    return
  }
  await resolvedViewer.dataSources.remove(source, true)
  store.remove(sourceId)
}

export function hasLayer(sourceId: string, viewer?: Viewer): boolean {
  const resolvedViewer = resolveViewer(viewer)
  if (!resolvedViewer) {
    return false
  }
  const store = getStore(resolvedViewer)
  return store.has(sourceId)
}
