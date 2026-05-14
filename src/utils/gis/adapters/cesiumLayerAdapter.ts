import {
  Cartesian2,
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  CustomDataSource,
  GeoJsonDataSource,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  type DataSource,
  type Entity,
  type Viewer,
} from 'cesium'
import type { FeatureCollection, Geometry, LineString, Point, Polygon } from 'geojson'
import { getViewerInstance } from '../../../components/Cesium/utils/viewerRegistry'
import { createLayerRegistry } from './layerRegistry'
import type {
  CesiumLayerOptions,
  GeoFeatureProperties,
  LayerEventHandlers,
  LayerInteractionEvent,
  MapFeatureStyle,
  MapLayerHandle,
} from '../types'

type EntityWithMeta = Entity & {
  __gisSourceId?: string
  __gisLayerId?: string
  __gisDefaultStyle?: MapFeatureStyle
  __gisDataSource?: DataSource
}

/**
 * 按 Viewer 维度缓存图层注册表，确保多实例场景互不影响。
 */
const layerStore = new WeakMap<Viewer, ReturnType<typeof createLayerRegistry<DataSource>>>()
const interactionStore = new WeakMap<
  Viewer,
  ReturnType<typeof createLayerRegistry<LayerEventHandlers<GeoFeatureProperties>>>
>()
const eventHandlerStore = new WeakMap<Viewer, ScreenSpaceEventHandler>()
const hoverEntityStore = new WeakMap<Viewer, EntityWithMeta | null>()
const selectedEntityStore = new WeakMap<Viewer, EntityWithMeta | null>()
const upsertQueueStore = new WeakMap<Viewer, Promise<void>>()

const waitForThrottle = async (delayMs = 24): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), delayMs)
  })
}

const enqueueUpsertTask = async <T>(viewer: Viewer, task: () => Promise<T>): Promise<T> => {
  const previous = upsertQueueStore.get(viewer) ?? Promise.resolve()

  let release!: () => void
  const current = new Promise<void>((resolve) => {
    release = () => resolve()
  })
  upsertQueueStore.set(
    viewer,
    previous.catch(() => undefined).then(() => current)
  )

  await previous.catch(() => undefined)

  try {
    await waitForThrottle()
    return await task()
  } finally {
    release()
  }
}

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
 * 请求 Cesium 重新渲染一帧。
 * 项目开启了 requestRenderMode，数据源显隐、样式切换这类手动变更后需要主动触发渲染。
 */
const requestViewerRender = (viewer: Viewer): void => {
  viewer.scene?.requestRender()
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

const getInteractionStore = (viewer: Viewer) => {
  const existed = interactionStore.get(viewer)
  if (existed) {
    return existed
  }
  const created = createLayerRegistry<LayerEventHandlers<GeoFeatureProperties>>()
  interactionStore.set(viewer, created)
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

const getPrimaryGeometryType = <G extends Geometry, P extends GeoFeatureProperties>(
  data: FeatureCollection<G, P>
): Geometry['type'] | null => {
  return data.features?.[0]?.geometry?.type ?? null
}

const toPlainSerializableValue = (value: unknown, stack = new WeakSet<object>()): unknown => {
  if (value === null) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null
  }

  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'undefined') {
    return undefined
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      const next = toPlainSerializableValue(item, stack)
      return next === undefined ? null : next
    })
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>
    if (stack.has(objectValue)) {
      return undefined
    }
    stack.add(objectValue)

    const result: Record<string, unknown> = {}
    Object.entries(objectValue).forEach(([key, item]) => {
      const next = toPlainSerializableValue(item, stack)
      if (next !== undefined) {
        result[key] = next
      }
    })

    stack.delete(objectValue)
    return result
  }

  return undefined
}

/**
 * 统一做深度可序列化净化，确保输入为纯 JSON 结构。
 */
const toSerializableGeoJson = <G extends Geometry, P extends GeoFeatureProperties>(
  data: FeatureCollection<G, P>
): FeatureCollection<G, P> => {
  const sanitized = toPlainSerializableValue(data)
  const fallback: FeatureCollection<G, P> = {
    type: 'FeatureCollection',
    features: [],
  }
  if (!sanitized || typeof sanitized !== 'object' || !('features' in sanitized)) {
    return fallback
  }
  return sanitized as FeatureCollection<G, P>
}

/**
 * 贴地策略：
 * - 线默认贴地，便于轨迹和边界线跟随地表
 * - 面默认不贴地，避开 Cesium GroundPrimitive 在 GeoJSON 多边形上的兼容问题
 * - 调用方显式传入 style.clampToGround 时优先尊重
 */
const resolveClampToGround = <G extends Geometry, P extends GeoFeatureProperties>(
  data: FeatureCollection<G, P>,
  style?: MapFeatureStyle
): boolean => {
  if (typeof style?.clampToGround === 'boolean') {
    return style.clampToGround
  }

  const geometryType = getPrimaryGeometryType(data)
  if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
    return false
  }

  return true
}

const getDataSourceEntities = (dataSource: DataSource): EntityWithMeta[] => {
  const sourceWithEntities = dataSource as Partial<CustomDataSource>
  if (!sourceWithEntities.entities || !Array.isArray(sourceWithEntities.entities.values)) {
    return []
  }
  return sourceWithEntities.entities.values as EntityWithMeta[]
}

const isDataSourceMatchedBySourceId = (dataSource: DataSource, sourceId: string): boolean => {
  const sourceName = (dataSource as { name?: string }).name
  if (typeof sourceName === 'string' && sourceName === sourceId) {
    return true
  }

  const entities = getDataSourceEntities(dataSource)
  if (entities.length === 0) {
    return false
  }

  return entities.some((entity) => entity.__gisSourceId === sourceId)
}

const applyStyleToEntity = (entity: EntityWithMeta, style: MapFeatureStyle = {}): void => {
  if (entity.point) {
    entity.point.pixelSize = new ConstantProperty(style.pointSize ?? 8)
    entity.point.color = new ConstantProperty(toCesiumColor(style.color))
    entity.point.outlineColor = new ConstantProperty(toCesiumColor(style.strokeColor ?? '#ffffff'))
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
  }
}

const restoreEntityStyle = (entity: EntityWithMeta): void => {
  applyStyleToEntity(entity, entity.__gisDefaultStyle ?? {})
}

const setDataSourceMeta = (
  dataSource: DataSource,
  sourceId: string,
  layerId: string,
  style: MapFeatureStyle | undefined
): void => {
  getDataSourceEntities(dataSource).forEach((entity) => {
    entity.__gisSourceId = sourceId
    entity.__gisLayerId = layerId
    entity.__gisDefaultStyle = style ?? {}
    entity.__gisDataSource = dataSource
  })
}

const getEntityProperties = <P extends GeoFeatureProperties>(
  viewer: Viewer,
  entity: Entity
): P | undefined => {
  const propertyBag = entity.properties
  if (!propertyBag) {
    return undefined
  }
  if ('getValue' in propertyBag && typeof propertyBag.getValue === 'function') {
    return propertyBag.getValue(viewer.clock.currentTime) as P | undefined
  }
  if (typeof propertyBag === 'object') {
    return propertyBag as unknown as P
  }
  return undefined
}

const createHighlight = (entity: EntityWithMeta, style: MapFeatureStyle = {}): void => {
  const fallback: MapFeatureStyle = {
    color: '#ffeb3b',
    strokeColor: '#ffeb3b',
    fillColor: '#fff176',
    fillOpacity: 0.48,
    strokeWidth: 4,
    pointSize: 12,
  }
  applyStyleToEntity(entity, {
    ...fallback,
    ...style,
  })
}

const createInteractionContext = <P extends GeoFeatureProperties>(params: {
  sourceId: string
  layerId: string
  viewer: Viewer
  entity: EntityWithMeta
  style?: MapFeatureStyle
  position?: Cartesian2
}): LayerInteractionEvent<P> => {
  const { sourceId, layerId, viewer, entity, style, position } = params
  return {
    sourceId,
    layerId,
    viewer,
    entity,
    position,
    properties: getEntityProperties<P>(viewer, entity),
    flyTo: async () => {
      await viewer.flyTo(entity)
    },
    fitBounds: async () => {
      if (entity.__gisDataSource) {
        await viewer.flyTo(entity.__gisDataSource)
        return
      }
      await viewer.flyTo(entity)
    },
    highlight: () => {
      createHighlight(entity, style)
    },
  }
}

const restoreTrackedEntity = (
  viewer: Viewer,
  store: WeakMap<Viewer, EntityWithMeta | null>
): void => {
  const entity = store.get(viewer)
  if (!entity) {
    return
  }
  restoreEntityStyle(entity)
  store.set(viewer, null)
}

const resetInteractionStateForSource = (viewer: Viewer, sourceId: string): void => {
  const hovered = hoverEntityStore.get(viewer)
  if (hovered?.__gisSourceId === sourceId) {
    restoreTrackedEntity(viewer, hoverEntityStore)
  }

  const selected = selectedEntityStore.get(viewer)
  if (selected?.__gisSourceId === sourceId) {
    restoreTrackedEntity(viewer, selectedEntityStore)
  }
}

const resolvePickedEntity = (picked: unknown): EntityWithMeta | null => {
  if (!picked || typeof picked !== 'object') {
    return null
  }

  const pickResult = picked as {
    id?: EntityWithMeta
    primitive?: {
      id?: EntityWithMeta
    }
  }

  const entity = pickResult.id ?? pickResult.primitive?.id
  if (!entity || !entity.__gisSourceId) {
    return null
  }
  return entity
}

const pickEntity = (viewer: Viewer, position: Cartesian2): EntityWithMeta | null => {
  const picked = viewer.scene.pick(position)
  if (!defined(picked)) {
    return null
  }
  return resolvePickedEntity(picked)
}

const ensureInteractionHandler = (viewer: Viewer): void => {
  const existed = eventHandlerStore.get(viewer)
  if (existed) {
    return
  }

  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)

  handler.setInputAction(async (movement: { position: Cartesian2 }) => {
    const entity = pickEntity(viewer, movement.position)
    if (!entity) {
      const selected = selectedEntityStore.get(viewer)
      if (selected) {
        restoreTrackedEntity(viewer, selectedEntityStore)
        requestViewerRender(viewer)
      }
      return
    }

    const sourceId = entity.__gisSourceId
    const layerId = entity.__gisLayerId
    if (!sourceId || !layerId) {
      return
    }

    const interactions = getInteractionStore(viewer).get(sourceId)
    if (!interactions || interactions.enable === false) {
      return
    }

    const selected = selectedEntityStore.get(viewer)
    if (selected && selected !== entity) {
      restoreEntityStyle(selected)
    }
    selectedEntityStore.set(viewer, entity)

    const context = createInteractionContext<GeoFeatureProperties>({
      sourceId,
      layerId,
      viewer,
      entity,
      style: interactions.clickStyle,
      position: movement.position,
    })

    if (interactions.highlightOnClick) {
      context.highlight()
    }

    if (interactions.fitBoundsOnClick) {
      await context.fitBounds()
    } else if (interactions.flyToOnClick) {
      await context.flyTo()
    }

    await interactions.onClick?.(context)
  }, ScreenSpaceEventType.LEFT_CLICK)

  handler.setInputAction(async (movement: { endPosition: Cartesian2 }) => {
    const entity = pickEntity(viewer, movement.endPosition)
    const hovered = hoverEntityStore.get(viewer)

    if (hovered && hovered !== entity && hovered !== selectedEntityStore.get(viewer)) {
      restoreEntityStyle(hovered)
    }

    if (!entity) {
      hoverEntityStore.set(viewer, null)
      return
    }

    const sourceId = entity.__gisSourceId
    const layerId = entity.__gisLayerId
    if (!sourceId || !layerId) {
      return
    }

    const interactions = getInteractionStore(viewer).get(sourceId)
    if (!interactions || interactions.enable === false) {
      return
    }

    hoverEntityStore.set(viewer, entity)

    const context = createInteractionContext<GeoFeatureProperties>({
      sourceId,
      layerId,
      viewer,
      entity,
      style: interactions.hoverStyle,
      position: movement.endPosition,
    })

    if (interactions.highlightOnHover && entity !== selectedEntityStore.get(viewer)) {
      context.highlight()
    }

    await interactions.onHover?.(context)
  }, ScreenSpaceEventType.MOUSE_MOVE)

  eventHandlerStore.set(viewer, handler)
}

/**
 * 给加载后的实体统一设置样式。
 * 说明：Cesium 实体属性多数是 Property 类型，这里统一使用 ConstantProperty 包装。
 */
const applyStyle = (dataSource: DataSource, style: MapFeatureStyle = {}): void => {
  const entities = (dataSource as CustomDataSource).entities.values as Entity[]
  entities.forEach((entity) => {
    applyStyleToEntity(entity as EntityWithMeta, style)
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
  const interactions = getInteractionStore(viewer)
  ensureInteractionHandler(viewer)

  return enqueueUpsertTask(viewer, async () => {
    const existed = store.get(sourceId)
    if (options.data.features.length === 0) {
      if (existed) {
        resetInteractionStateForSource(viewer, sourceId)
        await viewer.dataSources.remove(existed, true)
        store.remove(sourceId)
      }
      return createNoopHandle(sourceId, layerId, options.data)
    }

    if (existed) {
      resetInteractionStateForSource(viewer, sourceId)
      await viewer.dataSources.remove(existed, true)
      store.remove(sourceId)
    }

    let loaded: GeoJsonDataSource
    const serializableData = toSerializableGeoJson(options.data)
    const clampToGround = resolveClampToGround(serializableData, options.style)
    try {
      loaded = await GeoJsonDataSource.load(serializableData, {
        clampToGround,
        markerColor: toCesiumColor(options.style?.color),
        markerSize: options.style?.pointSize ?? 8,
        stroke: toCesiumColor(options.style?.strokeColor ?? options.style?.color),
        strokeWidth: options.style?.strokeWidth ?? 3,
        fill: toCesiumColor(
          options.style?.fillColor,
          '#4caf50',
          options.style?.fillOpacity ?? 0.35
        ),
      })
    } catch (error) {
      console.error('[GIS-CESIUM] GeoJSON 加载失败', error)
      return createNoopHandle(sourceId, layerId, options.data)
    }

    if (loaded.entities.values.length === 0) {
      console.warn('[GIS-CESIUM] 实体构建为空，跳过图层写入', {
        sourceId,
        layerId,
        featureCount: serializableData.features.length,
      })
      return createNoopHandle(sourceId, layerId, options.data)
    }

    loaded.name = layerId
    viewer.dataSources.add(loaded)
    applyStyle(loaded, options.style)
    setDataSourceMeta(loaded, sourceId, layerId, options.style)
    store.set(sourceId, loaded)
    requestViewerRender(viewer)
    if (options.events) {
      interactions.set(sourceId, options.events as LayerEventHandlers<GeoFeatureProperties>)
    } else {
      interactions.remove(sourceId)
    }

    if (options.flyTo) {
      await viewer.flyTo(loaded)
    }

    const destroy = async () => {
      const current = store.get(sourceId)
      if (!current) {
        return
      }
      resetInteractionStateForSource(viewer, sourceId)
      await viewer.dataSources.remove(current, true)
      store.remove(sourceId)
      interactions.remove(sourceId)
      requestViewerRender(viewer)
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
  })
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
  const interactions = getInteractionStore(resolvedViewer)
  const source = store.get(sourceId)

  if (source) {
    resetInteractionStateForSource(resolvedViewer, sourceId)
    await resolvedViewer.dataSources.remove(source, true)
    store.remove(sourceId)
    interactions.remove(sourceId)
    requestViewerRender(resolvedViewer)
    return
  }

  const fallbackSources: DataSource[] = []
  for (let index = 0; index < resolvedViewer.dataSources.length; index += 1) {
    const current = resolvedViewer.dataSources.get(index)
    if (isDataSourceMatchedBySourceId(current, sourceId)) {
      fallbackSources.push(current)
    }
  }

  if (fallbackSources.length === 0) {
    return
  }

  resetInteractionStateForSource(resolvedViewer, sourceId)
  await Promise.all(fallbackSources.map((item) => resolvedViewer.dataSources.remove(item, true)))
  store.remove(sourceId)
  interactions.remove(sourceId)
  requestViewerRender(resolvedViewer)
}

export function hasLayer(sourceId: string, viewer?: Viewer): boolean {
  const resolvedViewer = resolveViewer(viewer)
  if (!resolvedViewer) {
    return false
  }
  const store = getStore(resolvedViewer)
  return store.has(sourceId)
}

export function getLayerEntityCount(sourceId: string, viewer?: Viewer): number {
  const resolvedViewer = resolveViewer(viewer)
  if (!resolvedViewer) {
    return 0
  }

  const source = getStore(resolvedViewer).get(sourceId)
  if (!source) {
    return 0
  }

  return getDataSourceEntities(source).length
}

/**
 * 设置业务数据图层显隐。
 * 返回 boolean 是为了让 UI 层能区分“图层不存在”和“切换成功”，避免按钮状态误报。
 */
export function setLayerVisible(sourceId: string, visible: boolean, viewer?: Viewer): boolean {
  const resolvedViewer = resolveViewer(viewer)
  if (!resolvedViewer) {
    return false
  }

  const source = getStore(resolvedViewer).get(sourceId)
  if (!source) {
    return false
  }

  if (!visible) {
    resetInteractionStateForSource(resolvedViewer, sourceId)
  }
  source.show = visible
  requestViewerRender(resolvedViewer)
  return true
}
