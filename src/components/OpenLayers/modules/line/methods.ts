/**
 * line 模块方法集合。
 *
 * 提供线要素的创建、样式更新、删除能力。
 */
import Feature from 'ol/Feature'
import type Geometry from 'ol/geom/Geometry'
import LineString from 'ol/geom/LineString'
import { Stroke, Style } from 'ol/style'
import type VectorSource from 'ol/source/Vector'
import type { LineFeatureOptions, LineStyleOptions } from './types'

export type LineVectorFeature = Feature<Geometry>

/** 创建线样式对象。 */
function createLineStyle(style?: LineStyleOptions) {
  return new Style({
    stroke: new Stroke({
      color: style?.strokeColor ?? '#13c2c2',
      width: style?.strokeWidth ?? 3,
      lineDash: style?.lineDash,
    }),
  })
}

/**
 * 新增线要素。
 * @param source 线要素 source
 * @param options 线要素构建参数
 */
export function addLineFeature(
  source: VectorSource,
  options: LineFeatureOptions,
): Feature<LineString> {
  const feature = new Feature({
    geometry: new LineString(options.coordinates),
    ...options.properties,
  })

  if (options.id) {
    feature.setId(options.id)
  }

  feature.setStyle(createLineStyle(options.style))
  source.addFeature(feature)
  return feature
}

/** 更新线要素样式。 */
export function updateLineStyle(feature: LineVectorFeature, style?: LineStyleOptions) {
  feature.setStyle(createLineStyle(style))
}

/** 从 source 中删除线要素。 */
export function removeLineFeature(source: VectorSource, feature: Feature<LineString>) {
  source.removeFeature(feature)
}
