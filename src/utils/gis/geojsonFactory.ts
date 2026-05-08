import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { feature, featureCollection } from '@turf/helpers'
import type {
  FeatureCollectionWithMeta,
  FeatureWithMeta,
  GeoCollectionFactoryOptions,
  GeoFactoryOptions,
  GeoFeatureProperties,
} from './types'

/**
 * 统一时间戳，缺省自动取当前时间。
 */
const normalizeTimestamp = (value?: number): number => value ?? Date.now()

/**
 * 创建标准 GeoJSON Feature。
 *
 * 统一注入：
 * - id
 * - properties
 * - metadata
 * - style
 * - timestamp
 * - sourceType
 *
 * @param geometry 几何对象
 * @param options 构建配置
 * @returns 带 metadata 的 Feature
 */
export function createFeature<G extends Geometry, P extends GeoFeatureProperties>(
  geometry: G,
  options: GeoFactoryOptions<P> = {}
): FeatureWithMeta<G, P> {
  const timestamp = normalizeTimestamp(options.timestamp)
  const mergedMetadata = {
    ...options.metadata,
    sourceType: options.sourceType ?? options.metadata?.sourceType,
    timestamp,
  }

  const mergedProperties = {
    ...(options.properties ?? {}),
    ...(options.style ? { __style: options.style } : {}),
    __metadata: mergedMetadata,
  } as P

  const nextFeature = feature(geometry, mergedProperties, {
    id: options.id,
  })
  return {
    ...nextFeature,
    metadata: mergedMetadata,
  }
}

/**
 * 创建标准 GeoJSON FeatureCollection。
 *
 * 统一注入：
 * - 集合级 metadata
 * - 每条 feature 的 style 与 metadata
 * - 可选 sharedProperties
 *
 * @param features feature 数组
 * @param options 构建配置
 * @returns 带 metadata 的 FeatureCollection
 */
export function createFeatureCollection<G extends Geometry, P extends GeoFeatureProperties>(
  features: Array<Feature<G, P>>,
  options: GeoCollectionFactoryOptions<P> = {}
): FeatureCollectionWithMeta<G, P> {
  const timestamp = normalizeTimestamp(options.timestamp)
  const mergedMetadata = {
    ...options.metadata,
    sourceType: options.sourceType ?? options.metadata?.sourceType,
    timestamp,
  }

  const safeFeatures = Array.isArray(features) ? features : []

  const nextFeatures = safeFeatures.map((item) => {
    const properties = {
      ...(options.sharedProperties ?? {}),
      ...(item.properties ?? {}),
      ...(options.style ? { __style: options.style } : {}),
      __metadata: mergedMetadata,
    } as P
    return {
      ...item,
      properties,
    }
  })

  const result = featureCollection(nextFeatures) as FeatureCollection<G, P>

  return {
    ...result,
    metadata: mergedMetadata,
  }
}
