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

/** 生成 `[min, max]` 区间随机数。 */
function randomInRange(minValue: number, maxValue: number) {
  return minValue + Math.random() * (maxValue - minValue)
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
  const result: MockFeatureItem[] = []

  for (let index = 0; index < pointCount; index += 1) {
    const coordinate: [number, number] = [
      baseCenter[0] + ((index % 10) - 5) * 0.06,
      baseCenter[1] + (Math.floor(index / 10) - 2) * 0.05,
    ]

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

  for (let index = 0; index < lineCount; index += 1) {
    const startX = baseCenter[0] - 0.45 + index * 0.03
    const startY = baseCenter[1] - 0.25 + (index % 5) * 0.06
    const coordinates: [number, number][] = [
      [startX, startY],
      [startX + 0.18, startY + 0.08],
      [startX + 0.32, startY + 0.02],
    ]

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

  for (let index = 0; index < polygonCount; index += 1) {
    const offsetX = -0.38 + (index % 5) * 0.17
    const offsetY = 0.06 + Math.floor(index / 5) * 0.17
    const left = baseCenter[0] + offsetX
    const bottom = baseCenter[1] + offsetY
    const polygonCoordinates: [number, number][][] = [
      [
        [left, bottom],
        [left + 0.12, bottom],
        [left + 0.12, bottom + 0.1],
        [left, bottom + 0.1],
        [left, bottom],
      ],
    ]

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
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const result: MockFeatureItem[] = []

  for (let index = 0; index < pointCount; index += 1) {
    const coordinate: [number, number] = [
      randomInRange(bounds.minX, bounds.maxX),
      randomInRange(bounds.minY, bounds.maxY),
    ]

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

  for (let index = 0; index < lineCount; index += 1) {
    const startX = randomInRange(bounds.minX, bounds.maxX)
    const startY = randomInRange(bounds.minY, bounds.maxY)
    const coordinates: [number, number][] = [
      [startX, startY],
      [
        startX + randomInRange(-width * 0.12, width * 0.12),
        startY + randomInRange(-height * 0.12, height * 0.12),
      ],
      [
        startX + randomInRange(-width * 0.2, width * 0.2),
        startY + randomInRange(-height * 0.2, height * 0.2),
      ],
    ]

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

  for (let index = 0; index < polygonCount; index += 1) {
    const rectWidth = width * randomInRange(0.04, 0.09)
    const rectHeight = height * randomInRange(0.04, 0.09)
    const left = randomInRange(bounds.minX, bounds.maxX - rectWidth)
    const bottom = randomInRange(bounds.minY, bounds.maxY - rectHeight)
    const polygonCoordinates: [number, number][][] = [
      [
        [left, bottom],
        [left + rectWidth, bottom],
        [left + rectWidth, bottom + rectHeight],
        [left, bottom + rectHeight],
        [left, bottom],
      ],
    ]

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
