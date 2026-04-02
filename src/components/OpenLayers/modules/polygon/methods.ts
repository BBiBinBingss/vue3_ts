/**
 * polygon 模块方法集合。
 *
 * 提供面要素的创建、样式更新、删除能力。
 */
import Feature from 'ol/Feature'
import type Geometry from 'ol/geom/Geometry'
import Polygon from 'ol/geom/Polygon'
import { Fill, Stroke, Style } from 'ol/style'
import type VectorSource from 'ol/source/Vector'
import type { PolygonFeatureOptions, PolygonStyleOptions } from './types'

export type PolygonVectorFeature = Feature<Geometry>

/** 创建面样式对象。 */
function createPolygonStyle(style?: PolygonStyleOptions) {
  return new Style({
    fill: new Fill({ color: style?.fillColor ?? 'rgba(82, 196, 26, 0.2)' }),
    stroke: new Stroke({
      color: style?.strokeColor ?? '#52c41a',
      width: style?.strokeWidth ?? 2,
    }),
  })
}

/**
 * 新增面要素。
 * @param source 面要素 source
 * @param options 面要素构建参数
 */
export function addPolygonFeature(
  source: VectorSource,
  options: PolygonFeatureOptions,
): Feature<Polygon> {
  const feature = new Feature({
    geometry: new Polygon(options.coordinates),
    ...options.properties,
  })

  if (options.id) {
    feature.setId(options.id)
  }

  feature.setStyle(createPolygonStyle(options.style))
  source.addFeature(feature)
  return feature
}

/** 更新面要素样式。 */
export function updatePolygonStyle(feature: PolygonVectorFeature, style?: PolygonStyleOptions) {
  feature.setStyle(createPolygonStyle(style))
}

/** 从 source 中删除面要素。 */
export function removePolygonFeature(source: VectorSource, feature: Feature<Polygon>) {
  source.removeFeature(feature)
}
