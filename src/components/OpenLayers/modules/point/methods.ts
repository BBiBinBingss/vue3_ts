/**
 * point 模块方法集合。
 *
 * 提供点要素的创建、样式更新、删除能力。
 */
import Feature from 'ol/Feature'
import type Geometry from 'ol/geom/Geometry'
import Point from 'ol/geom/Point'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import type VectorSource from 'ol/source/Vector'
import type { PointFeatureOptions, PointStyleOptions } from './types'

export type PointVectorFeature = Feature<Geometry>

/** 创建点样式对象。 */
function createPointStyle(style?: PointStyleOptions) {
  return new Style({
    image: new CircleStyle({
      radius: style?.radius ?? 6,
      fill: new Fill({ color: style?.fillColor ?? 'rgba(24, 144, 255, 0.85)' }),
      stroke: new Stroke({
        color: style?.strokeColor ?? '#ffffff',
        width: style?.strokeWidth ?? 2,
      }),
    }),
  })
}

/**
 * 新增点要素。
 * @param source 点要素 source
 * @param options 点要素构建参数
 */
export function addPointFeature(
  source: VectorSource,
  options: PointFeatureOptions,
): Feature<Point> {
  const feature = new Feature({
    geometry: new Point(options.coordinate),
    ...options.properties,
  })

  if (options.id) {
    feature.setId(options.id)
  }

  feature.setStyle(createPointStyle(options.style))
  source.addFeature(feature)
  return feature
}

/** 更新点要素样式。 */
export function updatePointStyle(feature: PointVectorFeature, style?: PointStyleOptions) {
  feature.setStyle(createPointStyle(style))
}

/** 从 source 中删除点要素。 */
export function removePointFeature(source: VectorSource, feature: Feature<Point>) {
  source.removeFeature(feature)
}
