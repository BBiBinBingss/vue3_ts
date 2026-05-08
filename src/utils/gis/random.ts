import type { BBox, Feature, FeatureCollection, LineString, Point, Polygon } from 'geojson'
import { randomPoint, randomLineString, randomPolygon } from '@turf/random'
import bboxPolygon from '@turf/bbox-polygon'
import bezierSpline from '@turf/bezier-spline'
import area from '@turf/area'
import booleanValid from '@turf/boolean-valid'
import { createFeatureCollection } from './geojsonFactory'
import type {
  GeoFeatureProperties,
  RandomLineOptions,
  RandomPointOptions,
  RandomPolygonOptions,
} from './types'

/**
 * 默认 bbox（中国范围）
 */
const DEFAULT_BBOX: BBox = [72, 18, 136, 54]

/**
 * 随机生成偏亮颜色，避免地图上不可见。
 */
const createRandomColor = (): string => {
  const channel = () => Math.floor(Math.random() * 200 + 20)
  return `rgb(${channel()},${channel()},${channel()})`
}

/**
 * 归一化 bbox：非法值自动回退默认范围。
 */
const normalizeBbox = (bbox?: BBox): BBox => {
  const nextBbox = bbox ?? DEFAULT_BBOX
  const [minX, minY, maxX, maxY] = nextBbox
  if (minX >= maxX || minY >= maxY) {
    return DEFAULT_BBOX
  }
  return nextBbox
}

/**
 * 点位偏移，用于模拟偏移或位移测试。
 */
const applyOffsetToPoint = (
  coords: [number, number],
  offset?: [number, number]
): [number, number] => {
  if (!offset) {
    return coords
  }
  if (!Number.isFinite(offset[0]) || !Number.isFinite(offset[1])) {
    return coords
  }
  return [coords[0] + offset[0], coords[1] + offset[1]]
}

/**
 * 统一解析 properties：支持对象或函数工厂。
 */
const resolveProperties = <P extends GeoFeatureProperties>(
  index: number,
  source:
    | RandomPointOptions<P>['properties']
    | RandomLineOptions<P>['properties']
    | RandomPolygonOptions<P>['properties']
): Partial<P> => {
  if (typeof source === 'function') {
    return source(index)
  }
  return source ?? {}
}

/**
 * 统一 debug 日志开关。
 */
const withDebugLog = (debug: boolean | undefined, message: string, payload: unknown): void => {
  if (!debug) {
    return
  }
  console.info(`[GIS-RANDOM] ${message}`, payload)
}

/**
 * 归一化数量，负数与 NaN 自动纠正为 0。
 */
const normalizeCount = (count: number | undefined, fallback: number): number => {
  const raw = typeof count === 'number' ? count : fallback
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0
  }
  return Math.floor(raw)
}

/**
 * 随机点工厂。
 * @param options 配置项
 * @returns FeatureCollection<Point>
 */
export function createRandomPoints<P extends GeoFeatureProperties = GeoFeatureProperties>(
  options: RandomPointOptions<P> = {}
): FeatureCollection<Point, P> {
  const count = normalizeCount(options.count, 100)
  const bbox = normalizeBbox(options.bbox)
  const _bboxPolygon = bboxPolygon(bbox)

  if (count === 0) {
    return createFeatureCollection([], {
      metadata: {
        ...options.metadata,
        debug: options.debug,
      },
      sourceType: options.sourceType ?? 'simulation',
      timestamp: options.timestamp,
    })
  }

  const raw = randomPoint(count, { bbox }) as FeatureCollection<Point, P>
  const nextFeatures = raw.features.map((item, index) => {
    const properties = resolveProperties(index, options.properties)
    const id = `${options.id ?? 'point'}-${index + 1}`
    const color = options.randomColor ? createRandomColor() : undefined
    const clusterGroup = options.clusterTest ? Math.floor(index / 10) + 1 : undefined
    const nextCoordinates = applyOffsetToPoint(
      item.geometry.coordinates as [number, number],
      options.offset
    )

    return {
      ...item,
      id,
      geometry: {
        ...item.geometry,
        coordinates: nextCoordinates,
      },
      properties: {
        ...(item.properties ?? {}),
        ...properties,
        id,
        ...(color ? { color } : {}),
        ...(clusterGroup ? { clusterGroup } : {}),
      } as P,
    }
  })

  const result = createFeatureCollection(nextFeatures, {
    metadata: {
      ...options.metadata,
      debugBBox: JSON.stringify(_bboxPolygon.geometry.coordinates),
      debug: options.debug,
    },
    sourceType: options.sourceType ?? 'simulation',
    timestamp: options.timestamp,
  })

  withDebugLog(options.debug, 'createRandomPoints', {
    count,
    bbox,
    features: result.features.length,
  })
  return result
}

/**
 * 随机线工厂。
 * @param options 配置项
 * @returns FeatureCollection<LineString>
 */
export function createRandomLines<P extends GeoFeatureProperties = GeoFeatureProperties>(
  options: RandomLineOptions<P> = {}
): FeatureCollection<LineString, P> {
  const count = normalizeCount(options.count, 20)
  const bbox = normalizeBbox(options.bbox)
  const maxVertices = options.maxVertices ?? 8
  const maxLength = options.maxLength ?? 0.3

  if (count === 0) {
    return createFeatureCollection([], {
      metadata: {
        ...options.metadata,
        debug: options.debug,
      },
      style: options.style,
      sourceType: options.sourceType ?? 'simulation',
      timestamp: options.timestamp,
    })
  }

  const raw = randomLineString(count, {
    bbox,
    num_vertices: maxVertices,
    max_length: maxLength,
    max_rotation: Math.PI / 6,
  }) as FeatureCollection<LineString, P>

  const nextFeatures = raw.features.map((item, index) => {
    const properties = resolveProperties(index, options.properties)
    const id = `${options.id ?? 'line'}-${index + 1}`
    const curved = options.curve ? (bezierSpline(item) as Feature<LineString, P>) : item

    return {
      ...curved,
      id,
      properties: {
        ...(curved.properties ?? {}),
        ...properties,
        id,
        ...(options.mockTrack ? { trackId: id, speed: 30 + index } : {}),
      } as P,
    }
  })

  const result = createFeatureCollection(nextFeatures, {
    metadata: {
      ...options.metadata,
      debug: options.debug,
    },
    style: options.style,
    sourceType: options.sourceType ?? 'simulation',
    timestamp: options.timestamp,
  })

  withDebugLog(options.debug, 'createRandomLines', {
    count,
    bbox,
    maxVertices,
    maxLength,
    features: result.features.length,
  })

  return result
}

/**
 * 随机面工厂。
 * @param options 配置项
 * @returns FeatureCollection<Polygon>
 */
export function createRandomPolygons<P extends GeoFeatureProperties = GeoFeatureProperties>(
  options: RandomPolygonOptions<P> = {}
): FeatureCollection<Polygon, P> {
  const count = normalizeCount(options.count, 10)
  const bbox = normalizeBbox(options.bbox)
  const numVertices = options.numVertices ?? 6
  const maxRadialLength = options.maxRadialLength ?? 0.18

  if (count === 0) {
    return createFeatureCollection([], {
      metadata: {
        ...options.metadata,
        debug: options.debug,
      },
      sourceType: options.sourceType ?? 'simulation',
      timestamp: options.timestamp,
    })
  }

  const raw = randomPolygon(count, {
    bbox,
    num_vertices: numVertices,
    max_radial_length: maxRadialLength,
  }) as FeatureCollection<Polygon, P>

  const validateGeometry = options.validateGeometry ?? true
  const nextFeatures = raw.features
    .map((item, index) => {
      const properties = resolveProperties(index, options.properties)
      const id = `${options.id ?? 'polygon'}-${index + 1}`
      const color = options.randomColor ? createRandomColor() : undefined
      const geometryValid = validateGeometry ? booleanValid(item) : true
      if (!geometryValid) {
        return null
      }
      const polygonArea = options.areaTest ? area(item) : undefined

      return {
        ...item,
        id,
        properties: {
          ...(item.properties ?? {}),
          ...properties,
          id,
          ...(color ? { color } : {}),
          ...(typeof polygonArea === 'number' ? { area: polygonArea } : {}),
        } as P,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const result = createFeatureCollection(nextFeatures, {
    metadata: {
      ...options.metadata,
      debug: options.debug,
    },
    sourceType: options.sourceType ?? 'simulation',
    timestamp: options.timestamp,
  })

  withDebugLog(options.debug, 'createRandomPolygons', {
    count,
    bbox,
    numVertices,
    maxRadialLength,
    features: result.features.length,
  })

  return result
}
