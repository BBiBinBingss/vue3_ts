/**
 * map 模块方法集合。
 *
 * 主要能力：
 * - 创建/销毁地图上下文
 * - 生成批量 mock 数据（中心模式 / 视野模式）
 * - 点线面图层显隐控制
 * - 按要素飞行定位
 */
import Map from 'ol/Map'
import View from 'ol/View'
import { getCenter } from 'ol/extent'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { randomLineString, randomPoint, randomPolygon } from '@turf/turf'
import { defaults as defaultControls } from 'ol/control'
import {
  createBaseLayers,
  getDefaultVisibleBaseLayerNames,
  toggleBaseLayerVisibility,
} from '../layer'
import { addLineFeature } from '../line'
import { addPointFeature } from '../point'
import { addPolygonFeature } from '../polygon'
import type {
  MapContext,
  MockDisplayItem,
  MockFeatureItem,
  MockGeometryType,
  MockLoadOptions,
  OpenLayersMapOptions,
} from './types'

const defaultView = {
  projection: 'EPSG:4326',
  center: [114.4, 32.8] as [number, number],
  zoom: 7,
  maxZoom: 20,
  minZoom: 2,
}

interface MockGenerateBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

type TurfBBox = [number, number, number, number]

function buildBBox(bounds: MockGenerateBounds): TurfBBox {
  return [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]
}

function toCoordinatePair(coordinate: unknown): [number, number] {
  if (!Array.isArray(coordinate) || coordinate.length < 2) {
    return [114.4, 32.8]
  }

  const longitude = Number(coordinate[0])
  const latitude = Number(coordinate[1])

  if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
    return [114.4, 32.8]
  }

  return [longitude, latitude]
}

function toLineCoordinates(coordinates: unknown): [number, number][] {
  if (!Array.isArray(coordinates)) {
    return []
  }

  return coordinates
    .map((coordinate) => toCoordinatePair(coordinate))
    .filter((coordinate) => Number.isFinite(coordinate[0]) && Number.isFinite(coordinate[1]))
}

function toPolygonCoordinates(coordinates: unknown): [number, number][][] {
  if (!Array.isArray(coordinates)) {
    return []
  }

  const rings = coordinates.map((ring) => toLineCoordinates(ring))

  return rings.filter((ring) => ring.length >= 4)
}

/**
 * 获取当前地图可视范围。
 * 当 map size 不可用时，使用中心点与默认范围进行兜底。
 */
function getCurrentBounds(context: MapContext): MockGenerateBounds {
  const mapSize = context.map.getSize()

  if (!mapSize) {
    const center = context.map.getView().getCenter() as [number, number] | null
    const fallbackCenter = center ?? [114.4, 32.8]

    return {
      minX: fallbackCenter[0] - 0.5,
      maxX: fallbackCenter[0] + 0.5,
      minY: fallbackCenter[1] - 0.4,
      maxY: fallbackCenter[1] + 0.4,
    }
  }

  const extent = context.map.getView().calculateExtent(mapSize)

  return {
    minX: extent[0],
    minY: extent[1],
    maxX: extent[2],
    maxY: extent[3],
  }
}

/**
 * 创建地图上下文（底图 + 三个业务图层）。
 */
export function createMap(options: OpenLayersMapOptions): MapContext {
  const baseLayers = createBaseLayers()
  const pointSource = new VectorSource()
  const lineSource = new VectorSource()
  const polygonSource = new VectorSource()

  const polygonLayer = new VectorLayer({
    className: '业务面图层',
    source: polygonSource,
    zIndex: 1001,
  })

  const lineLayer = new VectorLayer({
    className: '业务线图层',
    source: lineSource,
    zIndex: 1002,
  })

  const pointLayer = new VectorLayer({
    className: '业务点图层',
    source: pointSource,
    zIndex: 1003,
  })

  const viewSettings = {
    ...defaultView,
    ...options.view,
  }

  const map = new Map({
    target: options.target,
    layers: [...Object.values(baseLayers), polygonLayer, lineLayer, pointLayer],
    view: new View(viewSettings),
    controls: defaultControls({
      zoom: false,
      rotate: false,
      attribution: false,
    }),
  })

  toggleBaseLayerVisibility(map, options.visibleBaseLayers ?? getDefaultVisibleBaseLayerNames())

  return {
    map,
    pointSource,
    lineSource,
    polygonSource,
    pointLayer,
    lineLayer,
    polygonLayer,
  }
}

/** 将几何类型转换为 UI 标签。 */
function getTypeLabel(type: MockGeometryType) {
  if (type === 'point') {
    return '点'
  }

  if (type === 'line') {
    return '线'
  }

  return '面'
}

/**
 * 以当前中心点为参考，生成规则分布的 mock 数据。
 *
 * 适合初始演示与稳定重现。
 */
export function loadMockFeatures(
  context: MapContext,
  options: MockLoadOptions = {},
): MockFeatureItem[] {
  const pointCount = options.pointCount ?? 40
  const lineCount = options.lineCount ?? 16
  const polygonCount = options.polygonCount ?? 10

  context.pointSource.clear()
  context.lineSource.clear()
  context.polygonSource.clear()

  const center = context.map.getView().getCenter() as [number, number] | null
  const baseCenter: [number, number] = center ?? [114.4, 32.8]
  const centerBounds: MockGenerateBounds = {
    minX: baseCenter[0] - 0.6,
    maxX: baseCenter[0] + 0.6,
    minY: baseCenter[1] - 0.45,
    maxY: baseCenter[1] + 0.45,
  }
  const bbox = buildBBox(centerBounds)
  const result: MockFeatureItem[] = []

  const pointCollection = randomPoint(pointCount, { bbox })
  const lineCollection = randomLineString(lineCount, {
    bbox,
    num_vertices: 4,
    max_length: 0.25,
    max_rotation: Math.PI / 6,
  })
  const polygonCollection = randomPolygon(polygonCount, {
    bbox,
    num_vertices: 6,
    max_radial_length: 0.12,
  })

  for (let index = 0; index < pointCollection.features.length; index += 1) {
    const feature = pointCollection.features[index]
    const coordinate = toCoordinatePair(feature.geometry.coordinates)

    const pointFeature = addPointFeature(context.pointSource, {
      id: `mock-point-${index + 1}`,
      coordinate,
      properties: { name: `Mock点位-${index + 1}` },
      style: {
        radius: 6,
        fillColor: 'rgba(250, 84, 28, 0.9)',
      },
    })

    result.push({
      id: `mock-point-${index + 1}`,
      type: 'point',
      typeLabel: getTypeLabel('point'),
      name: `Mock点位-${index + 1}`,
      description: `经纬度：[${coordinate[0].toFixed(3)}, ${coordinate[1].toFixed(3)}]`,
      feature: pointFeature,
    })
  }

  for (let index = 0; index < lineCollection.features.length; index += 1) {
    const feature = lineCollection.features[index]
    const coordinates = toLineCoordinates(feature.geometry.coordinates)

    if (coordinates.length < 2) {
      continue
    }

    const lineFeature = addLineFeature(context.lineSource, {
      id: `mock-line-${index + 1}`,
      coordinates,
      properties: { name: `Mock线路-${index + 1}` },
      style: {
        strokeColor: '#13c2c2',
        strokeWidth: 4,
        lineDash: [10, 6],
      },
    })

    result.push({
      id: `mock-line-${index + 1}`,
      type: 'line',
      typeLabel: getTypeLabel('line'),
      name: `Mock线路-${index + 1}`,
      description: `折线节点数：${coordinates.length}`,
      feature: lineFeature,
    })
  }

  for (let index = 0; index < polygonCollection.features.length; index += 1) {
    const feature = polygonCollection.features[index]
    const polygonCoordinates = toPolygonCoordinates(feature.geometry.coordinates)

    if (polygonCoordinates.length === 0) {
      continue
    }

    const polygonFeature = addPolygonFeature(context.polygonSource, {
      id: `mock-polygon-${index + 1}`,
      coordinates: polygonCoordinates,
      properties: { name: `Mock区域-${index + 1}` },
      style: {
        fillColor: 'rgba(82, 196, 26, 0.28)',
        strokeColor: '#52c41a',
        strokeWidth: 2,
      },
    })

    result.push({
      id: `mock-polygon-${index + 1}`,
      type: 'polygon',
      typeLabel: getTypeLabel('polygon'),
      name: `Mock区域-${index + 1}`,
      description: '矩形区域（4边）',
      feature: polygonFeature,
    })
  }

  return result
}

/**
 * 在当前视野范围内生成随机 mock 数据。
 *
 * 适合压测可视范围渲染与交互效果。
 */
export function loadMockFeaturesInViewport(
  context: MapContext,
  options: MockLoadOptions = {},
): MockFeatureItem[] {
  const pointCount = options.pointCount ?? 80
  const lineCount = options.lineCount ?? 30
  const polygonCount = options.polygonCount ?? 16

  context.pointSource.clear()
  context.lineSource.clear()
  context.polygonSource.clear()

  const bounds = getCurrentBounds(context)
  const bbox = buildBBox(bounds)
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const result: MockFeatureItem[] = []

  const pointCollection = randomPoint(pointCount, { bbox })
  const lineCollection = randomLineString(lineCount, {
    bbox,
    num_vertices: 4,
    max_length: Math.max(width * 0.18, 0.05),
    max_rotation: Math.PI / 5,
  })
  const polygonCollection = randomPolygon(polygonCount, {
    bbox,
    num_vertices: 7,
    max_radial_length: Math.max(Math.min(width, height) * 0.1, 0.03),
  })

  for (let index = 0; index < pointCollection.features.length; index += 1) {
    const feature = pointCollection.features[index]
    const coordinate = toCoordinatePair(feature.geometry.coordinates)

    const pointFeature = addPointFeature(context.pointSource, {
      id: `mock-point-${index + 1}`,
      coordinate,
      properties: { name: `视野点位-${index + 1}` },
      style: {
        radius: 6,
        fillColor: 'rgba(250, 84, 28, 0.9)',
      },
    })

    result.push({
      id: `mock-point-${index + 1}`,
      type: 'point',
      typeLabel: getTypeLabel('point'),
      name: `视野点位-${index + 1}`,
      description: `经纬度：[${coordinate[0].toFixed(3)}, ${coordinate[1].toFixed(3)}]`,
      feature: pointFeature,
    })
  }

  for (let index = 0; index < lineCollection.features.length; index += 1) {
    const feature = lineCollection.features[index]
    const coordinates = toLineCoordinates(feature.geometry.coordinates)

    if (coordinates.length < 2) {
      continue
    }

    const lineFeature = addLineFeature(context.lineSource, {
      id: `mock-line-${index + 1}`,
      coordinates,
      properties: { name: `视野线路-${index + 1}` },
      style: {
        strokeColor: '#13c2c2',
        strokeWidth: 4,
        lineDash: [10, 6],
      },
    })

    result.push({
      id: `mock-line-${index + 1}`,
      type: 'line',
      typeLabel: getTypeLabel('line'),
      name: `视野线路-${index + 1}`,
      description: `折线节点数：${coordinates.length}`,
      feature: lineFeature,
    })
  }

  for (let index = 0; index < polygonCollection.features.length; index += 1) {
    const feature = polygonCollection.features[index]
    const polygonCoordinates = toPolygonCoordinates(feature.geometry.coordinates)

    if (polygonCoordinates.length === 0) {
      continue
    }

    const ring = polygonCoordinates[0]
    const xs = ring.map((coordinate) => coordinate[0])
    const ys = ring.map((coordinate) => coordinate[1])
    const rectWidth = Math.max(...xs) - Math.min(...xs)
    const rectHeight = Math.max(...ys) - Math.min(...ys)

    const polygonFeature = addPolygonFeature(context.polygonSource, {
      id: `mock-polygon-${index + 1}`,
      coordinates: polygonCoordinates,
      properties: { name: `视野区域-${index + 1}` },
      style: {
        fillColor: 'rgba(82, 196, 26, 0.28)',
        strokeColor: '#52c41a',
        strokeWidth: 2,
      },
    })

    result.push({
      id: `mock-polygon-${index + 1}`,
      type: 'polygon',
      typeLabel: getTypeLabel('polygon'),
      name: `视野区域-${index + 1}`,
      description: `宽高约：${rectWidth.toFixed(3)} × ${rectHeight.toFixed(3)}`,
      feature: polygonFeature,
    })
  }

  return result
}

/** 将含 feature 的 mock 项转换为纯展示数据。 */
export function toMockDisplayItems(items: MockFeatureItem[]): MockDisplayItem[] {
  return items.map(({ feature: _feature, ...displayItem }) => displayItem)
}

/** 根据几何类型开关控制点/线/面图层显隐。 */
export function setGeometryLayerVisibility(context: MapContext, visibleTypes: MockGeometryType[]) {
  const visibleSet = new Set(visibleTypes)
  context.pointLayer.setVisible(visibleSet.has('point'))
  context.lineLayer.setVisible(visibleSet.has('line'))
  context.polygonLayer.setVisible(visibleSet.has('polygon'))
}

/**
 * 按 mock id 飞行到目标要素。
 *
 * - 点：使用 `view.animate` 聚焦
 * - 线/面：使用 `view.fit` 自适应范围
 */
export function flyToMockFeatureById(
  context: MapContext,
  mockItems: MockFeatureItem[],
  featureId: string,
): boolean {
  const target = mockItems.find((item) => item.id === featureId)

  if (!target) {
    return false
  }

  const geometry = target.feature.getGeometry()

  if (!geometry) {
    return false
  }

  const view = context.map.getView()
  const extent = geometry.getExtent()

  if (target.type === 'point') {
    view.animate({
      center: getCenter(extent),
      zoom: Math.max(view.getZoom() ?? 7, 12),
      duration: 1000,
    })

    return true
  }

  view.fit(extent, {
    duration: 1000,
    maxZoom: 13,
    padding: [120, 420, 120, 120],
  })

  return true
}

/** 销毁地图并清空所有业务 source。 */
export function destroyMap(context: MapContext | null) {
  if (!context) {
    return
  }

  context.map.setTarget(undefined)
  context.pointSource.clear()
  context.lineSource.clear()
  context.polygonSource.clear()
}
